define("js!Deferred", [], function(){

   var Deferred = function(){
      this._chained = false;
      this._chain   = [];
      this._fired   = -1;
      this._paused  = 0;
      this._results = [ null, null ];
      this._running = false;
   };

   Deferred.prototype._resback = function (res){
      this._fired = ((res instanceof Error) ? 1 : 0);
      this._results[this._fired] = res;
      this._fire();
   };

   Deferred.prototype._check = function (res, isError){
      if(isError === undefined)
         isError = false;
      if (this._fired != -1)
         throw new Error("Deferred is already fired with state '" + (this._fired == 1 ? "error" : "success") + "'");
      if (res instanceof Deferred)
         throw new Error("Deferred instances can only be chained if they are the result of a callback");
      if(isError && !(res instanceof Error)) {
         res = new Error(res);
         // Исправляем поведение IE8. Error(1) == { number: 1 }, Error("1") == { number: 1 }, Error("x1") == { message: "x1" }
         // Если после создания ошибки в ней есть поле number, содержащее число, а в message - пусто
         // Скастуем к строке и запишем в message
         if(!isNaN(res.number) && !res.message)
            res.message = "" + res.number;
      }
      return res;
   };

   /**
    * Запускает на выполнение цепочку коллбэков.
    * @param [res] результат асинхронной операции, передаваемой в коллбэк
    * @returns {Deferred}
    */
   Deferred.prototype.callback = function (res){
      this._resback(this._check(res));
      return this;
   };



   /**
    * Запуск цепочки обработки err-бэков.
    * @param [res] результат асинхронной операции
    * @returns {Deferred}
    */
   Deferred.prototype.errback = function (res){
      this._resback(this._check(res, true));
      return this;
   };

   /**
    * Добавляет один коллбэк как на ошибку, так и на успех
    * @param {Function} fn общий коллбэк
    * @returns {Deferred}
    */
   Deferred.prototype.addBoth = function (fn){
      if (arguments.length != 1)
         throw new Error("No extra args supported");
      return this.addCallbacks(fn, fn);
   };

   /**
    * Добавляет колбэк на успех
    * @param {Function} fn коллбэк на успех
    * @returns {Deferred}
    */
   Deferred.prototype.addCallback = function (fn){
      if (this._fired <= 0){
         if (arguments.length != 1)
            throw new Error("No extra args supported");
         return this.addCallbacks(fn, null);
      }
      else
         return this;
   };

   /**
    * Добавляет колбэк на ошибку
    * @param {Function} fn коллбэк на ошибку
    * @returns {Deferred}
    */
   Deferred.prototype.addErrback = function (fn){
      if (arguments.length != 1)
         throw new Error("No extra args supported");
      return this.addCallbacks(null, fn);
   };

   /**
    * Добавляет два коллбэка, один на успешный результат, другой на ошибку
    * @param {Function} cb коллбэк на успешный результат
    * @param {Function} eb коллбэк на ошибку
    * @returns {Deferred}
    */
   Deferred.prototype.addCallbacks = function (cb, eb){
      if (this._chained){
         throw new Error("Chained Deferreds can not be re-used");
      }
      if((cb !== null && typeof(cb) != 'function') || (eb !== null && typeof(eb) != 'function'))
         throw new Error("Both arguments required in addCallbacks");
      this._chain.push([cb, eb]);
      if (this._fired >= 0 && !this._running){
         // не запускаем выполнение цепочки при добавлении нового элемента, если цепочка уже выполняется
         this._fire();
      }
      return this;
   };

   /**
    * Вся логика обработки результата.
    * Вызов коллбэков-еррбэков, поддержка вложенного Deferred
    */
   Deferred.prototype._fire = function (){
      var chain = this._chain;
      var fired = this._fired;
      var res = this._results[fired];
      var self = this;
      var cb = null;
      while (chain.length > 0 && this._paused === 0){
         var pair = chain.shift();
         var f = pair[fired];
         if (f === null)
            continue;
         try{
            this._running = true; // Признак того, что Deferred сейчас выполняет цепочку
            res = f(res);
            fired = ((res instanceof Error) ? 1 : 0);
            if (res instanceof Deferred){
               cb = function (res){
                  self._resback(res);
                  self._paused--;
                  if ((self._paused === 0) && (self._fired >= 0))
                     self._fire();
               };
               this._paused++;
            }
         } catch (err){
            fired = 1;
            if (!(err instanceof Error))
               err = new Error(err);
            res = err;
            //TODO : подключить логгер logger
            //$ws.single.ioc.resolve('ILogger').error("Deferred", "Callback function throwing an error: " + err.message, err);
            console.log("Callback function throwing an error: " + err.message, err);
         } finally {
            this._running = false;
         }
      }
      this._fired = fired;
      this._results[fired] = res;
      if (cb && this._paused){
         res.addBoth(cb);
         res._chained = true;
      }
   };

   /**
    * Объявляет данный текущий Deferred зависимым от другого.
    * Колбэк/Еррбэк текущего Deferred будет вызван при соотвествтующем событии в "мастер"-Deferred
    *
    * @param {Deferred} dDependency Deferred, от которого будет зависеть данный
    * @returns {Deferred}
    */
   Deferred.prototype.dependOn = function(dDependency){
      var self = this;
      dDependency.addCallbacks(function(v){
         self.callback(v);
         return v;
      }, function(e){
         self.errback(e);
         return e;
      });
      return this;
   };

   /**
    * Создаёт новый Deferred, зависимый от этого.
    * Колбэк/Еррбэк этого Deferred-а будут вызваны при соотвествтующем событии исходного.
    *
    * @returns {Deferred}
    */
   Deferred.prototype.createDependent = function() {
      var dependent = new Deferred();
      return dependent.dependOn(this);
   };

   /**
    * @returns {Boolean} Готов или нет этот экземпляр (стрельнул с каким-то результатом)
    */
   Deferred.prototype.isReady = function(){
      return this._fired != -1;
   };

   /**
    * Показывает, не запрещено ли пользоваться методами, добавляющими обработчики: addCallbacks/addCallback/addErrback/addBoth.
    * Не влияет на возможность вызова методов callback/errback.
    * @return {Boolean} true: добавлять обработчики запрещено. false: добавлять обработчики можно.
    */
   Deferred.prototype.isCallbacksLocked = function() {
      return this._chained;
   };

   /**
    * @returns {Boolean} Завершился ли данный экземпляр ошибкой
    */
   Deferred.prototype.isSuccessful = function(){
      return this._fired === 0;
   };

   /**
    * Возвращает текущее значение Deferred
    *
    * @returns Текущее значение Deferred
    * @throws {Error} Когда значения яеще нет
    */
   Deferred.prototype.getResult = function() {
      if(this.isReady())
         return this._results[this._fired];
      else
         throw new Error("No result at this moment. Deferred is still not ready");
   };

   return Deferred;
});
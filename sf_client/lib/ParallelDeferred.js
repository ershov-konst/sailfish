define(["js!Deferred"], function(Deferred){
   var ParallelDeferred = function(cfg){
      this._successResult = undefined;
      this._ready = false;
      this._stepsCount = 0;
      this._stepsFinish = 0;
      this._stepsSuccess = 0;
      this._successHandler = null;
      this._errorHandler = null;
      this._dResult = null;
      this._errors = [];
      this._hasError = false;
      this._options = {
         stopOnFirstError : true
      };

      if (cfg && typeof cfg == "object"){
         for (var i in cfg){
            if (cfg.hasOwnProperty(i)){
               this._options[i] = cfg[i];
            }
         }
      }



      this._successHandler = (function(){
         var self = this;
         return function(res){
            if(!self._hasError){
               self._stepsFinish++;
               self._stepsSuccess++;
               self._check();
            }
            return res;
         }
      }).apply(this);

      this._errorHandler = (function(){
         var self = this;
         return function(res){
            if(self._fired === 1 || self._hasError) {
               return res;
            }
            if(self._options.stopOnFirstError) {
               self._hasError = true;
            }
            self._stepsFinish++;
            self._errors.push(res.message);
            self._check();
            return res;
         }
      }).apply(this);

      this._dResult = new Deferred();

      if(cfg && cfg["steps"] && cfg["steps"] instanceof Array) {
         for(var j = 0, l = cfg["steps"].length; j < l; j++)
            this.push(cfg["steps"][j]);
      }
   };


   /**
    * Добавление Deferred в набор
    * @param {Deferred} dOperation Асинхронная операция для добавления в набор
    * @returns {ParallelDeferred}
    */
   ParallelDeferred.prototype.push = function(dOperation) {
      if(this._ready)
         return this;
      if(dOperation instanceof Deferred) {
         this._stepsCount++;
         dOperation.addCallbacks(this._successHandler, this._errorHandler);
      }
      return this;
   };

   /**
    * Данная функция должна быть вызвана, когда закончено добавление всех элементов в набор.
    * ВНИМАНИЕ: При инициализации набора через конструктор done сам НЕ вызывается.
    *
    * @param {Object} [successResult] результат, который будет возвращен в случае успеха в общий колбэк
    * @returns {ParallelDeferred}
    */
   ParallelDeferred.prototype.done = function(successResult){
      this._ready = true;
      this._successResult = successResult;
      this._check();
      return this;
   };

   /**
    * Функция, выполняющая проверку, выполнен ли набор, и выполнен ли он успешно
    */
   ParallelDeferred.prototype._check = function(){
      if(!this._ready) // Пока добавление элементов не закончено - не вызывать результат
         return;
      if(this._stepsFinish == this._stepsCount || this._hasError) {
         if(this._stepsSuccess == this._stepsCount && !this._hasError)
            this._dResult.callback(this._successResult);
         else
            this._dResult.errback(this._errors.join('\n'));
      }
   };

   /**
    * Метод получения результирующего Deferred, который будет служить индикатором всего набора
    * @returns {Deferred}
    */
   ParallelDeferred.prototype.getResult = function(){
      return this._dResult;
   };

   ParallelDeferred.prototype.getStepsCount = function(){
      return this._stepsCount
   };

   ParallelDeferred.prototype.getStepsDone = function(){
      return this._stepsFinish;
   };

   ParallelDeferred.prototype.getStepsSuccess = function(){
      return this._stepsSuccess;
   };

   return ParallelDeferred;
});
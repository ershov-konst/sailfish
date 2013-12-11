define("js!EventBus", function(){

   var EventBusClass = function() {
      this.listeners = {};
   };

   EventBusClass.prototype = {
      on :function(eventName, callback, scope) {
         var args = [];
         var numOfArgs = arguments.length;
         for(var i=0; i<numOfArgs; i++){
            args.push(arguments[i]);
         }
         args = args.length > 3 ? args.splice(3, args.length-1) : [];
         if(typeof this.listeners[eventName] != "undefined") {
            this.listeners[eventName].push({scope:scope, callback:callback, args:args});
         } else {
            this.listeners[eventName] = [{scope:scope, callback:callback, args:args}];
         }
      },
      off :function(eventName, callback, scope) {
         if(typeof this.listeners[eventName] != "undefined") {
            var numOfCallbacks = this.listeners[eventName].length;
            var newArray = [];
            for(var i=0; i<numOfCallbacks; i++) {
               var listener = this.listeners[eventName][i];
               if(listener.scope == scope && listener.callback == callback) {

               } else {
                  newArray.push(listener);
               }
            }
            this.listeners[eventName] = newArray;
         }
      },
      has :function(eventName, callback, scope) {
         if(typeof this.listeners[eventName] != "undefined") {
            var numOfCallbacks = this.listeners[eventName].length;
            if(callback === undefined && scope === undefined){
               return numOfCallbacks > 0;
            }
            for(var i=0; i<numOfCallbacks; i++) {
               var listener = this.listeners[eventName][i];
               if(listener.scope == scope && listener.callback == callback) {
                  return true;
               }
            }
         }
         return false;
      },
      trigger :function(eventName, data) {
         var numOfListeners = 0;
         var event = {
            type:eventName,
            target:data
         };
         var args = [];
         var numOfArgs = arguments.length;
         for(var i=0; i<numOfArgs; i++){
            args.push(arguments[i]);
         }
         args = args.length > 2 ? args.splice(2, args.length-1) : [];
         args = [event].concat(args);
         if(typeof this.listeners[eventName] != "undefined") {
            var numOfCallbacks = this.listeners[eventName].length;
            for(var j=0; j<numOfCallbacks; j++) {
               var listener = this.listeners[eventName][j];
               if(listener && listener.callback) {
                  var concatArgs = args.concat(listener.args);
                  listener.callback.apply(listener.scope, concatArgs);
                  numOfListeners += 1;
               }
            }
         }
      },
      getEvents:function() {
         var str = "";
         for(var type in this.listeners) {
            if (this.listeners.hasOwnProperty(type)){
               var numOfCallbacks = this.listeners[type].length;
               for(var i=0; i<numOfCallbacks; i++) {
                  var listener = this.listeners[type][i];
                  str += listener.scope && listener.scope.className ? listener.scope.className : "anonymous";
                  str += " listen for '" + type + "'\n";
               }
            }
         }
         return str;
      }
   };


   var AdvancedEventBus = function(){
      this._channels = {};
   };

   AdvancedEventBus.prototype.channel = function(name){
      this._channels[name] = this._channels[name] || new EventBusClass();
      return this._channels[name];
   };

   AdvancedEventBus.prototype.removeChannel = function(name){
      delete this._channels[name];
   };
   return new AdvancedEventBus();
});

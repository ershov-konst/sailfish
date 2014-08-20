define("js!Abstract", ["js!utils", "js!Class", "js!EventBus"], function (utils, Class, EventBus) {

   return Class.extend({
      _options: {
         id : ''
      },
      _eventChannel : null,

      init : function(){
         this._options.id = this._options.id || utils.generateId();
         this._eventChannel = EventBus.channel(this._options.id);
      },
      trigger : function(type, target){
         this._eventChannel.trigger(type, target);
      },
      on : function(type, callback, scope){
         this._eventChannel.on(type, callback, scope);
      },
      off : function(type, callback, scope){
         this._eventChannel.off(type, callback, scope);
      },
      has : function(type, callback, scope){
         this._eventChannel.has(type, callback, scope);
      },
      getId : function(){
         return this._options.id;
      },
      destroy : function(){
         EventBus.removeChannel(this._options.id);
         this._eventChannel = null;
      }
   });
});

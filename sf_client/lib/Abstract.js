define("js!Abstract", ["js!Class", "js!EventBus"], function (Class, EventBus) {

   return Class.extend({
      _id : null,
      _eventChannel : null,

      init : function(){
         this._id = this._generateId();
         this._eventChannel = EventBus.channel(this._id);
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
         return this._id;
      },
      destroy : function(){
         EventBus.removeChannel(this._id);
      },
      _generateId : function(){
         return Math.random().toString(36).substring(7);
      }
   });
});
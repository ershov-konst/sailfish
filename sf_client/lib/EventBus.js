/**
 * @module js!EventBus
 */
define("js!EventBus", function(){
   /**
    * @class
    * @classdesc Simple event object
    * @alias EventObject
    * @constructor
    * @param {String} type Name of event
    */
   var EventObject = function(type){
      this.type = type;
      this.propagation = true;
   };

   /**
    * Prevents the event to next handlers
    */
   EventObject.prototype.stopPropagation = function(){
      this.propagation = false;
   };

   /**
    * Returns whether eventObject.stopPropagation() was ever called on this event object
    * @returns {boolean}
    */
   EventObject.prototype.isPropagationStopped = function(){
      return !this.propagation;
   };

   /**
    * @class
    * @classdesc Publish/subscribe API
    * @alias EventBusChannel
    * @constructor
    */
   var EventBusChannel = function() {
      this.listeners = {};
   };

   /**
    * Subscribe to an event
    * @param {String} type Name of event to subscribe
    * @param {Function} handler A function to execute when the event is triggered
    * @param [ctx] The value to be passed as the this parameter to the handler
    */
   EventBusChannel.prototype.on = function(type, handler, ctx) {
      this.listeners[type] = this.listeners[type] || [];

      this.listeners[type].push({
         ctx: ctx || window,
         handler: handler
      })
   };

   /**
    * Unsubscribe to event with specified name
    * @param {String} type Name of event for unsubscribing
    * @param {Function} handler Handler for unsubscribing
    * @param [ctx] context
    */
   EventBusChannel.prototype.off = function(type, handler, ctx) {
      var listener;
      if (this.listeners[type]){
         for (var i = 0, l = this.listeners[type].length; i < l; i++){
            listener = this.listeners[type][i];
            if (listener.handler == handler && listener.ctx == (ctx || window)){
               this.listeners[type].splice(i, 1);
               break;
            }
         }
      }
   };

   /**
    * Determine whether the specified handler subscribed with the specified context for the event with the specified name
    * @param {String} type Name of event
    * @param {Function} handler A function to execute when the event is triggered
    * @param [ctx]
    * @returns {boolean}
    */
   EventBusChannel.prototype.has = function(type, handler, ctx) {
      var listener;
      if (this.listeners[type]){
         for (var i = 0, l = this.listeners[type].length; i < l; i++){
            listener = this.listeners[type][i];
            if (listener.handler == handler && listener.ctx == (ctx || window)){
               return true;
            }
         }
      }
      return false;
   };

   /**
    * Execute all handlers that subscribe to an event with specified name
    * @param {String} type Name of event
    * @param {*} [arg]
    */
   EventBusChannel.prototype.trigger = function(type, arg) {
      var
         funcArgs = Array.prototype.concat.apply([], arguments),
         event = new EventObject(type),
         args = [event].concat(funcArgs.slice(1)),
         listener;

      if (this.listeners[type]){
         for (var i = 0, l = this.listeners[type].length; i < l; i++){
            listener = this.listeners[type][i];
            if (event.isPropagationStopped()){
               break;
            }
            if (listener && typeof listener.handler == 'function'){
               if (listener.handler.apply(listener.ctx, args) === false){
                  event.stopPropagation();
               }
            }
         }
      }
   };
   /**
    * Returns all handler subscribed to event with specified name
    * @param {String} type Name of event
    * @returns {*}
    */
   EventBusChannel.prototype.getHandlers = function(type) {
      return this.listeners[type];
   };

   /**
    * @class
    * @classdesc Manager for easy work with instances of the EventBusChannel
    * @alias module:js!EventBus
    * @constructor
    */
   var EventBus = function(){
      this._channels = {};
   };

   /**
    * Сreates (if not exists) and returns an instance of the EventBusChannel
    * @param {String} name name of requested EventBusChannel
    * @returns {EventBusChannel}
    */
   EventBus.prototype.channel = function(name){
      this._channels[name] = this._channels[name] || new EventBusChannel();
      return this._channels[name];
   };

   /**
    * Remove EventBusChannel with specified name
    * @param {String} name name of EventBusChannel
    */
   EventBus.prototype.removeChannel = function(name){
      delete this._channels[name];
   };

   return new EventBus();
});

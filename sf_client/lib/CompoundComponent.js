define("js!CompoundComponent", ["js!utils", "js!BaseComponent"], function(utils, BaseComponent){

   return BaseComponent.extend({
      _components: {},

      init : function(cfg){
         this._super(cfg);

         var components = utils.provideInnerComponents(this._container);
         for (var i = 0, l = components.length; i < l; i++){
            this._components[components[i].name()] = components[i];
         }
      }
   });
});
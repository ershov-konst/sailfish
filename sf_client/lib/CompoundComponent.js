define("js!CompoundComponent", ["js!utils", "js!BaseComponent"], function(core, BaseComponent){

   return BaseComponent.extend({
      init : function(cfg){
         this._super(cfg);

         this._components = core.provideInnerElements(this._container);
      }
   });
});
define("js!CompoundComponent", ["js!utils", "js!BaseComponent"], function(utils, BaseComponent){

   var CompoundComponent = BaseComponent.extend({
      _components: {},

      init : function(cfg){
         this._super(cfg);

         var components = utils.provideInnerComponents(this._container);
         for (var i = 0, l = components.length; i < l; i++){
            this._components[components[i].name()] = components[i];
         }
      },
      getComponentByName: function(name){
         var result = null;
         if (!name){
            return null;
         }
         if (this._components.hasOwnProperty(name)){
            result = this._components[name];
         }
         else{
            for (var i in this._components){
               if(this._components.hasOwnProperty(i) && this._components[i] instanceof CompoundComponent){
                  result = this._components[i].getComponentByName(name);
               }
               if (result){
                  break;
               }
            }
         }

         return result;
      }
   });

   return CompoundComponent;
});
define("js!CompoundComponent", ["js!utils", "js!BaseComponent"], function(utils, BaseComponent){

   var CompoundComponent = BaseComponent.extend({
      _components: null,
      _componentsIdHash: {},

      init : function(cfg){
         this._super(cfg);

         this._components = {};
         this._componentsIdHash = {};

         var components = utils.provideInnerComponents(this._container);
         for (var i = 0, l = components.length; i < l; i++){
            this._components[components[i].name()] = components[i];
            this._componentsIdHash[components[i].getId()] = components[i];
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
      },
      destroy: function(){
         for (var i in this._componentsIdHash){
            if (this._componentsIdHash.hasOwnProperty(i)){
               this._componentsIdHash[i].destroy();
            }
         }
         this._componentsIdHash = null;
         this._components = null;
         this._super();
      }
   });

   return CompoundComponent;
});
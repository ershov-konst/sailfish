define("js!ViewComponent", ["js!utils", "js!Class"], function (utils, Class) {

   return Class.extend({
      _components: null,
      init: function(){
         this._initComponents();
      },
      _initComponents: function(){
         utils.provideInnerComponents(document.body).forEach(function(component){
            var name = component && typeof component.name == 'function' && component.name();
            if (name){
               this._components[name] = component;
            }
         }.bind(this));
      }
   });

});
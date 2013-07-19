define(["js!BaseComponent", "html!ex.Button", "css!ex.Button"], function(BaseComponent, dotTplFn){

   var Button =  BaseComponent.extend({
      _dotTplFn : dotTplFn,
      init : function(cfg){
         this._super(cfg);
      }
   });

   return Button;
});

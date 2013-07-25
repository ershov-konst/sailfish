define("js!ex.Button", ["js!BaseComponent", "html!ex.Button", "is!browser?jQuery", "css!ex.Button"], function(BaseComponent, dotTplFn, $){

   var Button =  BaseComponent.extend({
      _dotTplFn : dotTplFn,
      init : function(cfg){
         this._super(cfg);
      },
      click : function(fn){
         $(this._container).click(fn);
      }
   });

   return Button;
});

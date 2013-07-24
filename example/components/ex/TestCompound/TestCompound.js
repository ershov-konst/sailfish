define("js!ex.TestCompound", ["js!CompoundComponent", "html!ex.TestCompound", "css!ex.TestCompound", "js!ex.Button"], function(CompoundComponent, dotTplFn){

   var TestCompound =  CompoundComponent.extend({
      _dotTplFn : dotTplFn,
      init : function(cfg){
         this._super(cfg);

         this._components["btn"].click(function(){
            alert("test");
         })
      }
   });

   return TestCompound;
});

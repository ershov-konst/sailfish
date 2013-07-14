define(function(){
   return {
      load: function (name, req, onload, config) {
         var path = "/super/" + name + ".js";
         if (typeof window == 'undefined'){
            path = ".." + path;
         }
         req([path], function (js) {
            onload(js);
         });

      }
   }
});
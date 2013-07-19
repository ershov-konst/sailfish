define(["path-resolver"], function(pr){
   return {
      load: function (name, req, onload, config) {
         name = pr(name, config) + ".js";

         req([name], function (js) {
            onload(js);
         });
      }
   }
});
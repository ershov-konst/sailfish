define(["path-resolver", "doT"], function(pr, doT){
   return {
      load: function (name, req, onload, config) {
         if (typeof window !== "undefined"){
            name = pr(name, config) + ".html";

            req(["text!" + name], function (html) {
               try{
                  onload(doT.template(html));
               }
               catch (e){
                  throw e;
               }
            });
         }
      }
   }
});
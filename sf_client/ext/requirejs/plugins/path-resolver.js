define(function(){
   return function(name, config){
      var
         path = [],
         nodePath;

      if (name.indexOf(".") > -1){ //если в имени содержиться точка, то понимаем, что это компонент

         if (typeof window == "undefined"){
            nodePath = require.nodeRequire("path");
            path.push(nodePath.relative(process.domain["sfPath"], process.domain["components"]) + "/");
         }
         else{
            path.push("/components/");
         }

         if (name.indexOf("/") == -1){
            name = name.replace(/[^\.]+$/g, function(c){
               return [c, c].join("/");
            });
         }

         name = name.replace(/\./, "/");
      }
      else{
         if (typeof window == "undefined"){
            nodePath = require.nodeRequire("path");
            path.push(nodePath.relative(process.domain["sfPath"], process.domain["sf_client"]) + "/lib/");
         }
         else{
            path.push("/sf_client/lib/")
         }
      }

      path.push(name);

      return path.join("");
   }

});

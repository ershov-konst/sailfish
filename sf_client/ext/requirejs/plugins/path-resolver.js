define(function(){
   return function(name, config){
      var path = [];

      if (name.indexOf(".") > -1){ //если в имени содержиться точка, то понимаем, что это компонент

         if (typeof window == "undefined"){
            path.push(sfApp.componentRelativePath);
         }
         else{
            path.push(config.baseUrl + "components/");
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
            path.push(sfApp.libRelativePath);
         }
         else{
            path.push(config.baseUrl + "sf_client/lib/")
         }
      }

      path.push(name);

      return path.join("");
   }

});

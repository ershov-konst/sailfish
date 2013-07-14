define(function(){
   return function(name, config){
      var path = [];

      if (name.indexOf(".") > -1){ //если в имени содержиться точка, то понимаем, что это компонент
         path.push("/components/");

         if (name.indexOf("/") == -1){
            name = name.replace(/[^\.]+$/g, function(c){
               return [c, c].join("/");
            });
         }

         name = name.replace(/\./g, "/");
      }
      else{
         path.push("/sf_client/lib/")
      }

      path.push(name);

      return path.join("");
   }

});

define(["path-resolver", "doT"], function(pr, doT){

   function loadFile(path) {
      var
         fs = require.nodeRequire('fs'),
         dot = require.nodeRequire("dot"),
         file = fs.readFileSync(path, 'utf8');

      if (file.indexOf('\uFEFF') === 0)
         file = file.substring(1);

      return dot.template(file);
   }

   return {
      load: function (name, req, onload, config) {
         name = pr(name, config) + ".html";

         if (typeof window !== "undefined"){
            req(["text!" + name], function (html) {
               try{
                  onload(doT.template(html));
               }
               catch (e){
                  throw e;
               }
            });
         }
         else{
            onload(loadFile(name));
         }
      },
      write : function(pluginName, moduleName, write){
         var name = pr(moduleName) + ".html";
         write('define("' + pluginName + '!' + moduleName  +
            '", function () { return ' + loadFile(name) + ';});\n');
      }
   }
});
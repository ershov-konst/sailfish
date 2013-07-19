var fs = require("fs");
var Component = require("./Component.js");
var doT = require("dot");
var requirejs = require('requirejs');
var path = require("path");
var jsBlock = doT.template('\
{{? it.sha }}\
<link rel="stylesheet" href="/sf_build/{{=it.sha}}.css"/>\
{{?}}\
<script type="text/javascript" src="/sf_client/ext/requirejs/require.js"></script>\
<script type="text/javascript" src="/sf_client/main.js"></script>\
{{? it.sha }}\
<script type="text/javascript" src="/sf_build/{{=it.sha}}.js"></script>\
{{?}}\
<script type="text/javascript">\
   require(["js!core"], function(core){\
      core.bootUp({{=it.dependencies}});\
   });\
</script>\
');

function _render(viewPath, options, fn, dependencies, sha){
   options["jsBlock"] = jsBlock({
      production : false,
      sha : sha || null,
      dependencies : JSON.stringify(dependencies)
   });

   fs.readFile(viewPath, "utf8", function(err, file){
      if (!err){
         fn(null, doT.template(file)(options));
      }
      else{
         fn(err);
      }
   });
}

module.exports = function(viewPath, options, fn){

   var
      isDevelopment = process.domain ? process.domain["isDevelopment"] : false,
      sfClientPath = process.domain["sf_client"],
      sfBuildPath = process.domain["sf_build"],
      dependencies = ["js!core"],
      sha;

   for (var i in options){
      if (options.hasOwnProperty(i)){
         if (options[i] instanceof Component){
            dependencies.push("js!" + options[i].getName());
         }
      }
   }
   //TODO : делаем md5 из массива dependencies
   sha = "1";

   if (!isDevelopment) {
      requirejs.optimize({
         mainConfigFile : path.join(sfClientPath, "main.js"),
         separateCSS : true,
         baseUrl : process.domain["sfPath"],
         include : dependencies,
         out : path.join(sfBuildPath, sha) + ".js"
      }, function(){
         console.log("конвертация прошла успешно");
         _render(viewPath, options, fn, dependencies, sha);
      });
   }
   else{
      _render(viewPath, options, fn, dependencies);
   }
};
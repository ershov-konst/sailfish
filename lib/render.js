var fs = require("fs");
var Component = require("./Component.js");
var doT = require("dot");
var jsBlock = doT.template('\
{{? it.production }}\
<link rel="stylesheet" href="/sf_build/{{=it.sha}}.css"/>\
{{?}}\
<script type="text/javascript" src="/core/ext/requirejs/require.js"></script>\
<script type="text/javascript" src="/core/main.js"></script>\
{{? it.production }}\
<script type="text/javascript" src="/sf_build/{{=it.sha}}.css.js"></script>\
{{?}}\
<script type="text/javascript">\
   require(["core"], function(core){\
      core.bootup({{=it.dependencies}});\
   });\
</script>\
');

module.exports = function(viewPath, options, fn){

   var dependencies = [];

   for (var i in options){
      if (options.hasOwnProperty(i)){
         if (options[i] instanceof Component){
            dependencies.push("js!" + options[i].getName());
         }
      }
   }

   options["jsBlock"] = jsBlock({
      production : false,
      sha : null,
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
};
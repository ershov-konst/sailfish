var
   fs = require("fs"),
   Component = require("./Component.js"),
   doT = require("dot"),
   requirejs = require('requirejs'),
   path = require("path"),
   nodeCrypto = require("crypto"),
   cache = {},
   jsBlock = doT.template('\
{{? it.hash }}\
<link rel="stylesheet" href="/sf_build/{{=it.hash}}.css"/>\
{{?}}\
<script type="text/javascript" src="/sf_client/ext/requirejs/require.js"></script>\
<script type="text/javascript" src="/sf_client/main.js"></script>\
{{? it.hash }}\
<script type="text/javascript" src="/sf_build/{{=it.hash}}.js"></script>\
{{?}}\
<script type="text/javascript">\
   require(["js!core"], function(core){\
      core.bootUp({{=it.dependencies}});\
   });\
</script>\
');

function _render(viewPath, options, fn, dependencies, hash){
   options["jsBlock"] = jsBlock({
      production : false,
      hash : hash || null,
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

function _createHash(deps){
   var md5 = nodeCrypto.createHash('md5');
   md5.update(deps.join(","));
   return md5.digest('hex');
}

module.exports = function(viewPath, options, fn){

   var
      isDevelopment = process.domain ? process.domain["isDevelopment"] : false,
      sfClientPath = process.domain["sf_client"],
      sfBuildPath = process.domain["sf_build"],
      dependencies = ["js!core"],
      include = [],
      hash;

   for (var i in options){
      if (options.hasOwnProperty(i)){
         if (options[i] instanceof Component){
            include.push("js!" + options[i].getName());
         }
      }
   }

   dependencies = dependencies.concat(include.sort());
   hash = _createHash(dependencies);

   if (!isDevelopment) {

      if (hash in cache){
         switch (cache[hash]){
            case "ready" :
               _render(viewPath, options, fn, dependencies, hash);
               break;
            case "inProgress" :
               _render(viewPath, options, fn, dependencies, hash);
               break;
         }
      }
      else{
         cache[hash] = "inProgress";
         requirejs.optimize({
            mainConfigFile : path.join(sfClientPath, "main.js"),
            separateCSS : true,
            baseUrl : process.domain["sfPath"],
            include : dependencies,
            out : path.join(sfBuildPath, hash) + ".js"
         }, function(){
            cache[hash] = "ready";
            _render(viewPath, options, fn, dependencies, hash);
         });
      }

      if (hash in cache && cache[hash] == "ready"){
         _render(viewPath, options, fn, dependencies, hash);
      }
      else {

      }
   }
   else{
      _render(viewPath, options, fn, dependencies);
   }
};
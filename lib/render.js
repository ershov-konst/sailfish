var
   fs = require("fs"),
   Component = require("./Component.js"),
   doT = require("dot"),
   requirejs = require('requirejs'),
   path = require("path"),
   nodeCrypto = require("crypto"),
   async = require("async"),
   domParser = new (require("xmldom").DOMParser)(),
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

//requirejs context
var req = requirejs.config((function(){
   var
      baseUrl = path.resolve(__dirname, "../"),
      main = fs.readFileSync(path.join(baseUrl, "sf_client/main.js"), "utf8"),
      json = main.replace(/(requirejs\.config\()|(\);$)/g, ""),
      config = JSON.parse(json);

   config.nodeRequire = require;
   config.baseUrl = baseUrl;
   return config;
})());

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

function _getInnerComponents(root){
   var
      liveCollection = root.getElementsByTagName("component"),
      deadCollection = [];

   for (var i = 0, l = liveCollection.length; i < l; i++){
      deadCollection.push(liveCollection[i]);
   }
   return deadCollection;
}

function _getMarkup(placeholder, cb){
   var componentName = placeholder.getAttribute("data-component");

   req(["js!" + componentName], function(ctor){
      var options = ctor.prototype._parseCfg(ctor.prototype._options, placeholder);
      try{
         if (ctor.prototype._dotTplFn){
            var
               html = ctor.prototype._dotTplFn(options),
               res = domParser.parseFromString(html).firstChild,
               innerComponents = _getInnerComponents(res);

            if (innerComponents.length){
               async.map(innerComponents, _getMarkup, function(err, result){
                  if(err){
                     cb(err);
                  }
                  else{
                     result.forEach(function(element, i){
                        innerComponents[i].parentNode.replaceChild(element, innerComponents[i]);
                     });
                     cb(null, res);
                  }
               })
            }
            else{
               cb(null, res)
            }
         }
      }
      catch (e){
         cb(e);
      }
   });
}

function _prepareOptions(isDevelopment, options, cb){
   var
      include = [],
      markup = [],
      helpObj = {};

   for (var i in options){
      if (options.hasOwnProperty(i)){
         if (options[i] instanceof Component){
            include.push("js!" + options[i].getName());
            markup.push(domParser.parseFromString(options[i].toString()).firstChild);
            helpObj[markup.length - 1] = i;
         }
      }
   }
   if (isDevelopment){
      cb(null, include, options)
   }
   else{
      async.map(markup, _getMarkup, function(err, results){
         if (!err){
            results.forEach(function(markup, index){
               options[helpObj[index]] = markup.toString();
            });
            cb(null, include, options);
         }
         else{
            cb(err);
         }
      });
   }
}

module.exports = function(viewPath, options, fn){

   var
      isDevelopment = process.domain ? process.domain["isDevelopment"] : false,
      sfClientPath = process.domain["sf_client"],
      sfBuildPath = process.domain["sf_build"],
      dependencies = ["js!core"],
      include = [],
      hash;

   _prepareOptions(isDevelopment, options, function(err, include, options){
      if (!err){

         dependencies = dependencies.concat(include.sort());
         hash = _createHash(dependencies);

         if (!isDevelopment) {

            if (hash in cache){
               switch (cache[hash]){
                  case "ready" :
                     _render(viewPath, options, fn, dependencies, hash);
                     break;
                  case "inProgress" :
                     _render(viewPath, options, fn, dependencies);
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
         }
         else{
            _render(viewPath, options, fn, dependencies);
         }
      }
      else{
         throw err;
      }
   });
};
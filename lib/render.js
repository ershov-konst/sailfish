var
   fs = require("fs"),
   Component = require("./Component.js"),
   doT = require("dot"),
   requirejs = require('requirejs'),
   path = require("path"),
   nodeCrypto = require("crypto"),
   async = require("async"),
   domParser = new (require("tensor-xmldom").DOMParser)(),
   jsBlock = doT.template(fs.readFileSync(path.resolve(__dirname, "tpl/js.dot"), "utf8")),
   cssBlock = doT.template(fs.readFileSync(path.resolve(__dirname, "tpl/css.dot"), "utf8"));

var Render = function(config){
   this.config = config;
   this.cache = {};
   this.req = this._prepareRequirejsCtx();
};

Render.prototype.render = function(viewPath, options, fn){
   var
      self = this,
      dependencies = ["js!core"],
      hash;

   this._prepareOptions(options, function(err, include, options){
      if (!err){

         dependencies = dependencies.concat(include.sort());
         hash = self._createHash(dependencies);

         if (!self.config["isDevelopment"]) {
            self._preparePackages(dependencies, function(err, hash){
               if (!err){
                  self._render(viewPath, options, fn, dependencies, hash);
               }
               else{
                  fn(err);
               }
            });
         }
         else{
            self._render(viewPath, options, fn, dependencies);
         }
      }
      else{
         throw err;
      }
   });
};

Render.prototype._prepareRequirejsCtx = function(){
   var
      requireCfg = this._getRequireConfig(),
      req = requirejs.config(requireCfg);

   requireCfg["fakePaths"].forEach(function(toFake){
      requirejs.define.apply(req, [toFake, function(){}]);
   });

   return req;
};

Render.prototype._getRequireConfig = function(){
   var
      baseUrl = path.resolve(__dirname, "../"),
      main = fs.readFileSync(path.join(baseUrl, "sf_client/main-server.js"), "utf8"),
      json = main.replace(/(requirejs\.config\()|(\);$)/g, ""),
      config = JSON.parse(json);

   config.nodeRequire = require;
   return config;
};

Render.prototype._prepareOptions = function(options, cb){
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
   if (this.config["isDevelopment"]){
      cb(null, include, options)
   }
   else{
      async.map(markup, this._getMarkup.bind(this), function(err, results){
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
};

Render.prototype._getMarkup = function(placeholder, cb){
   var
      self = this,
      componentName = placeholder.getAttribute("data-component");

   this.req(["js!" + componentName], function(ctor){
      var options = ctor.prototype._parseCfg(ctor.prototype._options, placeholder);
      try{
         if (ctor.prototype._dotTplFn){
            var
               html = ctor.prototype._dotTplFn(options),
               elem = domParser.parseFromString(html).firstChild,
               res = ctor.prototype._prepareContainer(placeholder, elem),
               innerComponents = self._getInnerComponents(res);

            if (innerComponents.length){
               async.map(innerComponents, self._getMarkup.bind(self), function(err, result){
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
};

Render.prototype._getInnerComponents = function(root){
   var
      liveCollection = root.getElementsByTagName("component"),
      deadCollection = [];

   for (var i = 0, l = liveCollection.length; i < l; i++){
      deadCollection.push(liveCollection[i]);
   }
   return deadCollection;
};

Render.prototype._preparePackages = function(dependencies, cb){
   var
      self = this,
      hash = this._createHash(dependencies);
   if (hash in self.cache){
      switch (self.cache[hash]){
         case "ready" :
            cb(null, hash);
            break;
         case "inProgress" :
            cb(null);
            break;
      }
   }
   else{
      self.cache[hash] = "inProgress";
      requirejs.optimize({
         mainConfigFile : path.join(self.config["sf_client"], "main-server.js"),
         separateCSS : true,
         include : dependencies,
         out : path.join(self.config["sf_build"], hash) + ".js",
         mode: "optimization"
      }, function(){
         self.cache[hash] = "ready";
         cb(null, hash);
      }, function(err){
         cb(err);
      });
   }
};

Render.prototype._render = function(viewPath, options, fn, dependencies, hash){
   options["jsBlock"] = jsBlock({
      hash : hash || null,
      dependencies : JSON.stringify(dependencies)
   });
   options["cssBlock"] = cssBlock({
      hash : hash || null
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

Render.prototype._createHash = function(deps){
   var md5 = nodeCrypto.createHash('md5');
   md5.update(deps.join(","));
   return md5.digest('hex');
};

module.exports = Render;

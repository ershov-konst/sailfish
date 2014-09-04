var
   fs = require("fs"),
   domain = require('domain'),
   Component = require("./Component.js"),
   doT = require("../sf_client/ext/dot/doT.js"),
   requirejs = require('requirejs'),
   path = require("path"),
   nodeCrypto = require("crypto"),
   async = require("async"),
   jsBlock = doT.template(fs.readFileSync(path.resolve(__dirname, "tpl/js.dot"), "utf8")),
   cssBlock = doT.template(fs.readFileSync(path.resolve(__dirname, "tpl/css.dot"), "utf8")),
   global = (function(){return this || (0,eval)('this')})();

var Render = function(config, req){
   this.req = req;
   this.config = config;
   this.cache = {};
};

Render.prototype.render = function(viewPath, options, fn){
   var
      self = this,
      dependencies = ['js!' + viewPath];

   this._prepareOptions(options, function(err, include, options){
      if (!err){

         //include sorted dependencies that was collected from options
         //first element of dependencies == extender of ViewComponent
         dependencies = dependencies.concat(include.sort());

         if (!self.config["debug"]) {
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

Render.prototype._prepareOptions = function(options, cb){
   var
      include = [],
      markup = [],
      helpObj = {};

   for (var i in options){
      if (options.hasOwnProperty(i)){
         if (options[i] instanceof Component){
            include.push("js!" + options[i].getName());
            markup.push(options[i].toString());
            helpObj[markup.length - 1] = i;
         }
      }
   }
   if (this.config["debug"]){
      cb(null, include, options)
   }
   else{
      async.map(markup, this._getMarkup.bind(this), function(err, results){
         if (!err){
            results.forEach(function(markup, index){
               options[helpObj[index]] = markup;
            });
            cb(null, include, options);
         }
         else{
            cb(err);
         }
      });
   }
};

Render.prototype._getMarkup = function(markup, cb){
   var req = this.req;

   req(['js!BaseComponent'], function(BaseComponent){
      (function(nodeReq, reqJs){
         var res, err = null;
         global.require = reqJs;
         try{
            res = BaseComponent.prototype._prepareMarkup(markup);
         }
         catch(e){
            err = e;
         }
         global.require = nodeReq;
         cb(err, res);
      })(require, req);
   });
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

   this.req(
      ['html!' + viewPath],
      function(tpl){
         fn(null, tpl(options));
      },
      function(err){
         fn(err);
      }
   );
};

Render.prototype._createHash = function(deps){
   var md5 = nodeCrypto.createHash('md5');
   md5.update(deps.join(","));
   return md5.digest('hex');
};

module.exports = Render;

var
   domain = require('domain').create(),
   express = require('express'),
   nodePath = require('path'),
   fs = require('fs'),
   extend = require("node.extend"),
   lessCompiler = require("./lib/lessCompiler"),
   render = require("./lib/render"),
   router = require("./lib/router");

/**
 * @param config
 * @constructor
 */
var Sailfish = function(config){
   var self = this;

   this.handlers = {};
   this.app = express();
   this.config = this._validateConfig(config);

   this.config["isDevelopment"] = this.config["isDevelopment"] !== undefined ? this.config["isDevelopment"] : 'development' == this.app.get('env');
   this.config["port"] = this.config["port"] || process.env.PORT;

   if (!this.config["isDevelopment"]){
      lessCompiler(config["components"], function(err){
         if (err){
            throw err;
         }
         else{
            self._run();
         }
      });
   }
   else{
      self._run();
   }
};

/**
 * Add event listener
 * @param {String} event
 * @param {Function} fn callback
 */
Sailfish.prototype.on = function(event, fn){
   var a = [];
   if (typeof fn == "function"){
      a = this.handlers[event] = this.handlers[event] || [];
      a.push(fn);
   }
};

/**
 *
 * @param config
 * @returns {*}
 * @private
 */
Sailfish.prototype._validateConfig = function(config){
   function validateAndResolvePath(param){
      if (config[param]){
         config[param] = nodePath.resolve(config["rootPath"], config[param]);

         if (!fs.existsSync(config[param])){
            throw new Error(param + " : '" + config[param] + "' not found");
         }
      }
      else{
         throw new Error("config param '" + param + "' is not defined");
      }
   }

   if (config["rootPath"]){
      if (!fs.existsSync(config["rootPath"])){
         throw new Error("rootPath : '" + config["rootPath"] + "' not found");
      }
   }
   else{
      throw new Error("config param 'rootPath' is not defined");
   }

   validateAndResolvePath("components");
   validateAndResolvePath("controllers");
   validateAndResolvePath("views");

   return config;
};

Sailfish.prototype._run = function(){
   var self = this;

   this.config["sf_client"] = nodePath.join(__dirname, "sf_client");
   this.config["sf_build"]  = nodePath.join(__dirname, "sf_build");

   //create folder for js/css packages
   if(!fs.existsSync(this.config["sf_build"])){
      fs.mkdirSync(this.config["sf_build"]);
   }

   this._prepareRequireJsCfg();

   this.render = new render(this.config);
   this.router = new router(this.config);

   //provide favicon if defined
   if (this.config["favicon"]){
      this.app.use(express.favicon(nodePath.resolve(this.config["rootPath"], this.config["favicon"])));
   }

   if (this.config["isDevelopment"]) {
      //less middleware
      this.app.use('/components', require('less-middleware')({
         src: this.config["components"],
         force : true
      }));
   }
   else{
      this.app.use('/sf_build', express.static(this.config["sf_build"]));
   }

   //static files
   this.app.use('/components', express.static(this.config["components"]));
   this.app.use('/views',      express.static(this.config["views"]));
   this.app.use('/sf_client',  express.static(this.config["sf_client"]));

   //render engine
   this.app.set('views', this.config["views"]);
   this.app.set('view engine', 'xhtml');
   this.app.engine('xhtml', this.render.render.bind(this.render));

   //routing
   this.app.all(/\/(?:([^\/]*)\/?)?(?:([^\/]*)\/?)?(.*)?/, this.router.route.bind(this.router));

   //errors handling
   this.app.use(function(err, req, res, next) {
      if (err){
         self._notify("error", [err, req, res]);
      }
      else{
         next();
      }
   });


   domain.run(function(){
      //path resolver use process.domain
      process.domain["componentRelativePath"] = nodePath.relative(self.config["rootPath"], self.config["components"]) + "/";
      process.domain["libRelativePath"]       = nodePath.relative(self.config["rootPath"], self.config["sf_client"]) + "/lib/";

      self.app.listen(self.config["port"]);
      console.log("sailfish application running at http://localhost:" + self.config["port"] + " [" + (self.config["isDevelopment"] ? "development" : "production") + " mode]");
      self._notify("start");
   });
};

Sailfish.prototype._prepareRequireJsCfg = function(){
   var
      systemCfg = require("./lib/requirejs.json"),
      clientCfg = this.config["requirejs"] || {},
      path = this.config["sf_client"],
      clientsPaths = Object.keys(clientCfg["paths"] || {}),
      result = {};

   extend(true, result, systemCfg, clientCfg);

   //config for client
   fs.writeFileSync(nodePath.join(path, "main.js"), "requirejs.config("+ JSON.stringify(result, null, 3) +");");

   //this paths will be faked for working requirejs on server
   result["fakePaths"] = clientsPaths;

   //prepare config for working on nodejs
   for (var i in result["paths"]){
      if (result["paths"].hasOwnProperty(i)){
         if (clientsPaths.indexOf(i) > -1){
            if (!/^(\/\/)|(http)/.test(result["paths"][i])){
               result["paths"][i] = nodePath.resolve(this.config["rootPath"], result["paths"][i]);
            }
         }
         else{
            result["paths"][i] = nodePath.relative(this.config["rootPath"], nodePath.join(__dirname, result["paths"][i]));
         }
      }
   }

   result["baseUrl"] = this.config["rootPath"];

   //config for server
   fs.writeFileSync(nodePath.join(path, "main-server.js"), "requirejs.config("+ JSON.stringify(result, null, 3) +");");
};

Sailfish.prototype._notify = function(event, args){
   var a = this.handlers[event] = this.handlers[event] || [];
   a.forEach(function(hdl){
      hdl.apply(null, args);
   })
};

module.exports = {
   Sailfish  : Sailfish,
   Component : require("./lib/Component.js")
};

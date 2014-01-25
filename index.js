var
   domain = require('domain'),
   express,
   nodePath = require('path'),
   fs = require('fs'),
   extend = require("node.extend"),
   requirejs = require('requirejs'),
   lessCompiler = require("./lib/lessCompiler"),
   render = require("./lib/render"),
   router = require("./lib/router");

/**
 * @param {Object} cfg - config
 * @constructor
 */
var Sailfish = function(cfg){
   var self = this;

   this.componentRelativePath = undefined;
   this.libRelativePath = undefined;
   this.requirejsCfg = undefined;
   this.requirejs = undefined;
   this.sfReady = false;
   this.app = express();

   this.config = this._validateConfigSync(cfg);

   this._run();

   if (!self.config['debug']){
      //prepare css if current running mode is production
      lessCompiler(self.config["components"], function(err){
         if (!err){
            self.sfReady = true;
         }
         else{
            throw err;
         }
      });
   }
   else {
      this.sfReady = true;
   }
};

/**
 * validate and resolve paths in configuration
 * @param {Object} config - application cfg
 * @private
 */
Sailfish.prototype._validateConfigSync = function(config){
   var optionsToValidate = {
      'components' : './components',
      'controllers': './controllers',
      'views'      : './views'
   };

   /**
    * validate and resolve required param
    * @param {String} param - required param
    */
   function validateAndResolvePath(param){
      //resolve path, use param from config or default value
      config[param] = nodePath.resolve(config["rootPath"], config[param] || optionsToValidate[param]);

      //check resolved path on disk
      if(!fs.existsSync(config[param])){
         throw new Error(param + " : '" + config[param] + "' not found");
      }
   }

   config = config || {};

   config['rootPath'] = config['rootPath'] || process.cwd();

   if (fs.existsSync(config["rootPath"])){
      //if exist - continue validation
      for (var param in optionsToValidate){
         if (optionsToValidate.hasOwnProperty(param)){
            validateAndResolvePath(param)
         }
      }
   }
   else{
      throw new Error("rootPath : '" + config["rootPath"] + "' not found");
   }

   return config;
};

/**
 * prepare environment and start express
 * @private
 */
Sailfish.prototype._run = function(){
   var self = this;

   //path for frontend resources
   this.config["sf_client"] = nodePath.join(__dirname, "sf_client");
   //path for js/css packages
   this.config["sf_build"]  = nodePath.join(__dirname, "sf_build");

   this.componentRelativePath = nodePath.relative(self.config["rootPath"], self.config["components"]) + "/";
   this.libRelativePath = nodePath.relative(self.config["rootPath"], self.config["sf_client"]) + "/lib/";

   if(!fs.existsSync(this.config["sf_build"])){
      fs.mkdirSync(this.config["sf_build"]);
   }

   this.requirejsCfg = this._prepareRequireJsCfg();
   this.requirejs = this._prepareRequirejsCtx();

   this.render = new render(this.config, this.requirejs);
   this.router = new router(this.config);

   //prepare domain
   this.app.use(function(req, res, next){
      if (self.sfReady){
         domain.createDomain().run(function(){
            //requirejs module "path-resolver" use process.domain
            process.domain["componentRelativePath"] = self.componentRelativePath;
            process.domain["libRelativePath"]       = self.libRelativePath;
            next();
         });
      }
      else{
         res.send(503);
      }
   });

   //less middleware
   this.app.use('/components', require('less-middleware')({
      src: this.config["components"],
      force : true
   }));

   //serve dir with build results
   if (!this.config["debug"]) {
      this.app.use('/sf_build', express.static(this.config["sf_build"]));
   }

   //static files
   this.app.use('/components', express.static(this.config["components"]));
   this.app.use('/views',      express.static(this.config["views"]));
   this.app.use('/sf_client',  express.static(this.config["sf_client"]));

   //render engine
   this.app.set('views', this.config["views"]);
   this.app.set('view engine', 'xhtml');
   this.app.engine('html', this.render.render.bind(this.render));

   //routing
   this.app.all(/\/(?:([^\/]*)\/?)?(?:([^\/]*)\/?)?(.*)?/, this.router.route.bind(this.router));
};

/**
 * Prepare main.js for server-side and client-side
 * @private
 */
Sailfish.prototype._prepareRequireJsCfg = function(){
   var
      systemCfg = require("./lib/requirejs.json"),
      clientCfg = this.config["requirejs"] || {},
      path = this.config["sf_client"],
      clientsPaths = Object.keys(clientCfg["paths"] || {}),
      result = {};

   extend(true, result, systemCfg, clientCfg);

   //save config for client
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

   //save config for server
   fs.writeFileSync(nodePath.join(path, "main-server.js"), "requirejs.config("+ JSON.stringify(result, null, 3) +");");

   return result;
};

/**
 * retrurns local requirejs
 * @returns {*}
 * @private
 */
Sailfish.prototype._prepareRequirejsCtx = function(){
   var req = requirejs.config(this.requirejsCfg);

   this.requirejsCfg["fakePaths"].forEach(function(toFake){
      requirejs.define.apply(req, [toFake, function(){}]);
   });

   return req;
};

/**
 * Returns expressjs app
 * @returns {*}
 */
Sailfish.prototype.getApp = function(){
   return this.app;
};

var moduleExports = function(expressjs, cfg){
   express = expressjs;
   var sf = new Sailfish(cfg);
   return sf.getApp();
};

moduleExports.Sailfish = Sailfish;
moduleExports.Component = require("./lib/Component.js");
module.exports = moduleExports;

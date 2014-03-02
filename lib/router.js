/**
 * router.js
 */

var
   fs = require('fs'),
   nodePath = require("path");

var Router = function(config, controllersPath){
   var self = this;
   this.controllers = {};

   fs.readdirSync(controllersPath).forEach(function(controller){
      self.controllers[controller.replace(/\..*$/, "")] = require(nodePath.join(controllersPath, controller));
   });
};

Router.prototype.route = function(req, res, next){
   var
      controller = req.params[0] || "index",
      action = req.params[1] || "index";

   process.domain && process.domain.on('error', function(e){
      next(e);
   });

   if (controller in this.controllers && action in this.controllers[controller]){
      req.params = req.params[2] ? req.params[2].split("/") : [];
      this.controllers[controller][action](req, res, next);
   }
   else if("index" in this.controllers && controller in this.controllers["index"]){
      var p = [req.params[1] || "", req.params[2] || ""].join("/");
      req.params = p.split("/");
      this.controllers["index"][controller](req, res, next);
   }
   else{
      next();
   }
};

var baseRouting = function(controllersPath){
   var
      router = new Router(controllersPath),
      regExp = /\/(?:([^\/]*)\/?)?(?:([^\/]*)\/?)?(.*)?/;

   return function(req, res, next){
      req.params = req.originalUrl.exec(regExp) || [];
      router.route.apply(router, arguments);
   }
};

module.exports = baseRouting;


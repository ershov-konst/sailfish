/**
 * router.js
 */

var
   fs = require('fs'),
   controllers = {},
   controllersPath = process.domain["controllers"],
   nodePath = require("path");

function RouteError(code, message) {
   this.code = code;
   this.message = message;
}
RouteError.prototype = new Error;

fs.readdirSync(controllersPath).forEach(function(controller){
   controllers[controller.replace(/\..*$/, "")] = require(nodePath.join(controllersPath, controller));
});

module.exports = function(req, res, next){
   var
      controller = req.params[0] || "index",
      action = req.params[1] || "index";

   if (controller in controllers && action in controllers[controller]){
      req.params = req.params[2] ? req.params[2].split("/") : [];
      controllers[controller][action](req, res, next);
   }
   else if("index" in controllers && controller in controllers["index"]){
      req.params = req.params[1] ? req.params[1].split("/") : [];
      controllers["index"][controller](req, res, next);
   }
   else{
      throw new RouteError(404, "unhandled request " + req.originalUrl);
   }
};


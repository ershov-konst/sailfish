/**
 * router.js
 */

var
   fs = require('fs'),
   controllers = {},
   controllersPath = process.domain["controllers"],
   nodePath = require("path");

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
   else{
      throw new Error('404');
   }
};


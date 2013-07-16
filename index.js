var
   domain = require('domain').create(),
   express = require('express'),
   app = express(),
   nodePath = require('path'),
   fs = require('fs'),
   handlers = {};

/**
 * Validate config and prepare config params
 * @param config
 * @returns {*}
 */
function validateConfig(config){

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
}

/**
 * run handlers
 * @param event
 * @param args
 */
function notifyEvent(event, args){
   var a = handlers[event] = handlers[event] || [];
   a.forEach(function(hdl){
      hdl.apply(null, args);
   })
}

module.exports = {
   server : {
      /**
       * append event handler
       * @param event
       * @param fn
       */
      on : function(event, fn){
         var a = handlers[event] = handlers[event] || [];
         if (typeof fn == "function"){
            a.push(fn);
         }
      },
      /**
       * run application
       * @param config
       * @param cb
       */
      run : function(config, cb){

         config = validateConfig(config);

         var rootPath = config["rootPath"];
         var controllers = config["controllers"];
         var components  = config["components"];
         var views  = config["views"];
         var core  = nodePath.join(__dirname, "sf_client");
         var port  = process.env.PORT || config["port"];

         //less middleware
         app.use('/components', require('less-middleware')({
            src: components,
            force : true
         }));

         //static files
         app.use('/components', express.static(components));
         app.use('/views', express.static(views));
         app.use('/sf_client', express.static(core));

         domain.run(function(){

            process.domain["express"]    = app;
            process.domain["rootPath"]   = rootPath;
            process.domain["components"] = components;
            process.domain["controllers"]= controllers;
            process.domain["views"]      = views;
            process.domain["core"]       = core;

            //render engine
            app.set('views', views);
            app.set('view engine', 'xhtml');
            app.engine('xhtml', require('./lib/render'));

            //routing
            app.all(/\/(?:([^\/]*)\/?)?(?:([^\/]*)\/?)?(.*)?/, require('./lib/router.js'));

            //errors handling
            app.use(function(err, req, res, next) {
               if (err){
                  notifyEvent("error", [err, req, res]);
               }
               else{
                  next();
               }
            });

            app.listen(port);
            console.log("sailfish application running at http://localhost:" + port);
            if (typeof cb == "function"){
               cb();
            }
         });
      }
   },
   Component : require("./lib/Component.js")
};

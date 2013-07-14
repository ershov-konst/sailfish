var
   domain = require('domain').create(),
   express = require('express'),
   app = express(),
   nodePath = require('path'),
   fs = require('fs');

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

module.exports = {
   server : {
      /**
       * Обработка событий. Пока только error
       */
      on : function(event, fn){
         if (event == "error"){
            domain.on("error", function(err){
               console.log(err);
               fn(err);
            });
         }
      },
      /**
       * Запуск сервера
       */
      run : function(config, cb){

         config = validateConfig(config);

         var rootPath = config["rootPath"];
         var controllers = config["controllers"];
         var components  = config["components"];
         var views  = config["views"];
         var core  = nodePath.join(__dirname, "sf_client");
         var port  = process.env.PORT || config["port"];

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

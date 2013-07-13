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
         var port  = process.env.PORT || config["port"];

         //static files for components
         app.use('/components', express.static(components));

         domain.run(function(){

            process.domain["express"]    = app;
            process.domain["rootPath"]   = rootPath;
            process.domain["components"] = components;
            process.domain["controllers"]= controllers;
            process.domain["core"]       = nodePath.join(__dirname, "client");

            //routing
            app.all(/\/(?:([^\/]*)\/?)?(?:([^\/]*)\/?)?(.*)?/, require('./lib/router.js'));

            app.listen(port);
            console.log("sailfish application running at http://localhost:" + port);
            if (typeof cb == "function"){
               cb();
            }
         });
      }
   }
};

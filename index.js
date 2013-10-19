var
   domain = require('domain').create(),
   express = require('express'),
   app = express(),
   nodePath = require('path'),
   fs = require('fs'),
   handlers = {},
   extend = require("node.extend"),
   isDevelopment = 'development' == app.get('env');

/**
 * Create and save config for requirejs
 * @param {String} path path for save config
 * @param {Object} cfg app configuration
 */
function createRequirejsCfg(path, cfg){
   var
      systemCfg = require("./lib/requirejs.json"),
      clientCfg = cfg["requirejs"] || {},
      clientsPaths = [],
      result = {};

   clientsPaths = Object.keys(clientCfg["paths"] || {});

   extend(true, result, systemCfg, clientCfg);

   //config for client
   fs.writeFileSync(nodePath.join(path, "main.js"), "requirejs.config("+ JSON.stringify(result, null, 3) +");");

   //this paths will be faked for working requirejs on server
   result["fakePaths"] = clientsPaths;

   //prepare config for working on nodejs
   for (var i in result["paths"]){
      if (result["paths"].hasOwnProperty(i)){
         if (clientsPaths.indexOf(i) > -1){
            result["paths"][i] = nodePath.resolve(cfg["rootPath"], result["paths"][i]);
         }
         else{
            result["paths"][i] = nodePath.join(__dirname, result["paths"][i]);
         }
      }
   }

   //config for server
   fs.writeFileSync(nodePath.join(path, "main-server.js"), "requirejs.config("+ JSON.stringify(result, null, 3) +");");
}

/**
 * Validate config and prepare config params
 * @param config
 * @returns {Object}
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

/**
 * run app
 * @param config
 * @param cb
 */
function run(config, cb){
   var
      controllers = config["controllers"],
      components  = config["components"],
      views  = config["views"],
      sf_client  = nodePath.join(__dirname, "sf_client"),
      sf_build  = nodePath.join(__dirname, "sf_build"),
      port  = process.env.PORT || config["port"],
      appPath = config["rootPath"];

   config["sf_client"] = sf_client;

   createRequirejsCfg(sf_client, config);

   if (config["favicon"]){
      app.use(express.favicon(nodePath.resolve(config["rootPath"], config["favicon"])));
   }

   if (isDevelopment) {
      //less middleware
      app.use('/components', require('less-middleware')({
         src: components,
         force : true
      }));
   }
   else{
      app.use('/sf_build', express.static(sf_build));
   }

   //static files
   app.use('/components', express.static(components));
   app.use('/views', express.static(views));
   app.use('/sf_client', express.static(sf_client));

   domain.run(function(){

      process.domain["isDevelopment"] = isDevelopment;
      process.domain["express"]       = app;
      process.domain["sfPath"]        = __dirname;
      process.domain["components"]    = components;
      process.domain["controllers"]   = controllers;
      process.domain["views"]         = views;
      process.domain["sf_client"]     = sf_client;
      process.domain["sf_build"]      = sf_build;
      process.domain["appPath"]       = appPath;

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
      console.log("sailfish application running at http://localhost:" + port + " [" + (isDevelopment ? "development" : "production") + " mode]");
      if (typeof cb == "function"){
         cb();
      }
   });
}

/**
 * compile all *.less files into path
 * @param {String} path
 * @param cb
 */
function compileLess(path, cb){
   var
      fs = require('fs'),
      walk = require('walk'),
      less = require('less'),
      nodePath = require('path'),
      parser = new(less.Parser)({
         paths: [path] // Specify search paths for @import directives
      }),
      walker = walk.walk(path);

   walker.on("file", function(root, fileStats, next){
      if (/\.less$/.test(fileStats.name)){
         var fullPath = nodePath.join(root, fileStats.name);

         fs.readFile(fullPath, "utf8", function(error, data){
            if (!error){
               parser.parse(data, function (e, tree) {
                  if (!e){
                     fs.writeFile(fullPath.replace("less", "css"), tree.toCSS(), function(err){
                        if (!err){
                           next();
                        }
                        else{
                           throw err;
                        }
                     });
                  }
                  else{
                     throw e;
                  }
               });
            }
            else{
               throw error;
            }
         });
      }
      else{
         next();
      }
   });
   walker.on("end", function(){
      if (typeof cb === "function"){
         cb();
      }
   });
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

         if (!isDevelopment){
            compileLess(config["components"], function(err){
               if (err){
                  throw err;
               }
               else{
                  run(config, cb);
               }
            });
         }
         else{
            run(config, cb);
         }
      }
   },
   Component : require("./lib/Component.js")
};

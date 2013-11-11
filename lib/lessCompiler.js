var
   fs = require('fs'),
   walk = require('walk'),
   less = require('less'),
   nodePath = require('path');

var lessCompiler = function(path){
   var
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
};

module.exports = lessCompiler;
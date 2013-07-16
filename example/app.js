var sailfish = require("../index.js").server;
var config = require("./config.json");

config["rootPath"] = __dirname;

sailfish.run(config);

sailfish.on("error", function(err, req, res){
   console.log(err);
});
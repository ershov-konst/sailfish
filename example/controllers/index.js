var Component = require("../../index.js").Component;

module.exports = {
   index : function(req, res){
      res.render("main", {
         title : "sailfish.js - example",
         content : new Component("ex.Button", {
            caption : "Hello world"
         })
      });
   }
};
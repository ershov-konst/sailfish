var Component = require("../../index.js");

module.exports = {
   index : function(req, res){
      res.render("main", {
         content : new Component("ex.Button", {
            caption : "Hello world"
         })
      });
   }
};
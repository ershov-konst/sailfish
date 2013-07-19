var Component = function(className, options){
   this.className = className;
   this.options = options;
};

Component.prototype.toString = function(){
   return "<component type='"+ this.className +"' config='"+ JSON.stringify(this.options) +"'/>";
};

Component.prototype.getName = function(){
   return this.className;
};

module.exports = Component;
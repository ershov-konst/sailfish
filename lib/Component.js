var Component = function(className, options){
   this.className = className;
   this.options = options;
};

Component.prototype.toString = function(){
   return "<component data-class='"+ this.className +"' config='"+ JSON.stringify(this.options) +"'/>";
};

Component.prototype.getName = function(){
   return this.className;
};

module.exports = Component;
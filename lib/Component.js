var Component = function(className, options){
   this.className = className;
   this.options = options || {};
};

Component.prototype.toString = function(){
   return "<component data-component='"+ this.className +"' config='"+ JSON.stringify(this.options) +"'/>";
};

Component.prototype.getName = function(){
   return this.className;
};

Component.prototype.getOptions = function(){
   return this.options;
};

module.exports = Component;
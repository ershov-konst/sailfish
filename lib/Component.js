var Component = function(className, options){
   this.className = className;
   this.options = options || {};
};

Component.prototype.toString = function(){
   return "<component data-component='"+ this.className +"' config='"+ this._encodeConfig() +"' />";
};

Component.prototype.getName = function(){
   return this.className;
};

Component.prototype._encodeConfig = function(){
   return encodeURIComponent(JSON.stringify(this.options)).replace(/'/g, '&quot;');
};

Component.prototype.getOptions = function(){
   return this.options;
};

module.exports = Component;
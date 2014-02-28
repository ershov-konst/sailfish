define('js!Node', function(){

   var Node = function(cfg){
      this.nodeType   = cfg.nodeType;
      this.nodeName   = cfg.nodeName;
      this.attributes = cfg.attributes || [];
      this.childNodes = cfg.childNodes;
      this.parentNode = cfg.parentNode;
      this.text       = cfg.text;
   };

   Node.prototype.getAttribute = function(attributeName){
      for (var i = 0 , l = this.attributes.length; i < l; i++){
         if (this.attributes[i].name == attributeName){
            return this.attributes[i].value;
         }
      }
      return null;
   };

   Node.prototype.innerHTML = function(){
      var
         result = '',
         cNode;
      for (var i = 0, l = this.childNodes.length; i < l; i++){
         cNode = this.childNodes[i];
         result += cNode.nodeType === 3 ? cNode.text : cNode.outerHTML();
      }
      return result;
   };

   Node.prototype.outerHTML = function(){
      return this._getOpenTagStr() + this.innerHTML() + this._getCloseTagStr();
   };

   Node.prototype.getElementsByTagName = function(tagName){
      var result = [];
      if (this.nodeType !== 3){
         for (var i = 0, l = this.childNodes.length; i < l; i++){
            if (this.childNodes[i].nodeName == tagName){
               result.push(this.childNodes[i]);
            }
            result = result.concat(this.childNodes[i].getElementsByTagName(tagName));
         }
      }
      return result;
   };

   Node.prototype._getOpenTagStr = function(){
      return '<' + this.nodeName + (this.attributes.length ? ' ' : '') + this.attributes.map(function(attr){return attr.name + '="' + attr.value +'"'}).join(' ') + '>';
   };
   Node.prototype._getCloseTagStr = function(){
      return '</' + this.nodeName + '>';
   };

   return Node;
});
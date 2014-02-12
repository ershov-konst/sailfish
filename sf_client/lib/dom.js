define('js!dom', function(){
   var
      tagRegExp = /(<?\/?[a-z][a-z0-9]*\s*(?:\s+[a-z0-9-_]+=(?:(?:'.*?')|(?:".*?")))*\s*>)|([^<]|<(?![a-z\/]))*/gi,
      attrRegExp = /\s[a-z0-9-_]+\b(=('|").*\2)?/gi,
      startComponent = /^<component/,
      endComponent = /^<\/component>/,
      startTag = /^<[a-z]/,
      selfClose = /\/>$/,
      closeTag = /^<\//,
      nodeName = /<([a-z][a-z0-9]*)/i;

   var Node = function(cfg){
      this.startTag   = cfg.startTag || '';
      this.closeTag   = '';

      this.nodeType   = cfg.nodeType;
      this.nodeName   = cfg.nodeName;
      this.attributes = cfg.attributes;
      this.childNodes = cfg.childNodes;
      this.parentNode = cfg.parentNode;
      this.text       = cfg.text;
   };

   Node.prototype.getAttribute = function(attributeName){
      return this.attributes[attributeName] || null;
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
      return this.startTag + this.innerHTML() + this.closeTag;
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

   function replaceComponents(markup, fn){
      var
         result = '',
         componentStr = '',
         tagsCount = 0,
         tags = markup.match(tagRegExp);

      for (var i = 0, l = tags.length; i < l; i++){
         if (startComponent.test(tags[i])){
            tagsCount++;
            componentStr += tags[i];
         }
         else if (endComponent.test(tags[i])){
            tagsCount--;
            componentStr += tags[i];
            if (tagsCount === 0){
               result += fn(componentStr);
               componentStr = '';
            }
         }
         else{
            result += tags[i];
         }
      }

      return result;
   }

   function parse(markup){
      var
         tags = markup instanceof Array ? markup : markup.match(tagRegExp),
         result = new Node({
            childNodes: [],
            parentNode: null
         }),
         buffer,
         currentObject = result,
         tag,
         attrBuffer = [],
         attrStr = [],
         attributes = {};

      for (var i = 0, l = tags.length; i < l; i++){
         tag = tags[i];

         if (startTag.test(tag)){
            attributes = {};
            attrStr = tag.match(attrRegExp) || [];
            for (var aI = 0, aL = attrStr.length; aI < aL; aI++){
               attrBuffer = attrStr[aI].split('=');
               attributes[attrBuffer[0]] = attrBuffer[1] || '';
            }
            currentObject.childNodes.push(buffer = new Node({
               nodeType: 1, //element node
               nodeName : tag.match(nodeName)[1],
               attributes: attributes,
               childNodes: [],
               parentNode: currentObject,
               startTag: tag
            }));
            if (!selfClose.test(tag)){
               currentObject = buffer;
            }
         }
         else if (closeTag.test(tag)){
            currentObject.closeTag = tag;
            currentObject = currentObject.parentNode;
         }
         else {
            currentObject.childNodes.push(new Node({
               nodeType: 3,
               text: tag,
               parentNode: currentObject
            }));
         }
      }
      return result;
   }

   return {
      parse: parse,
      replaceComponents : replaceComponents
   }
});
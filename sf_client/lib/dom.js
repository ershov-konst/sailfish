define('js!dom', ['js!Node'], function(Node){
   var
      tagRegExp = /(<\/?[a-z][a-z0-9]*\s*(?:\s+[a-z0-9-_]+=(?:(?:'.*?')|(?:".*?")))*\s*\/?>)|([^<]|<(?![a-z\/]))*/gi,
      attrRegExp = /\s[a-z0-9-_]+\b(=('|").*?\2)?/gi,
      startComponent = /^<component/,
      endComponent = /^<\/component>/,
      startTag = /^<[a-z]/,
      selfClose = /\/>$/,
      closeTag = /^<\//,
      nodeName = /<([a-z][a-z0-9]*)/i,
      attributeQuotes = /(^'|")|('|")$/g;

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
            if (componentStr.length){
               componentStr += tags[i];
            }
            else{
               result += tags[i];
            }
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
         attributes = [];

      for (var i = 0, l = tags.length; i < l; i++){
         tag = tags[i];

         if (startTag.test(tag)){
            attributes = [];
            attrStr = tag.match(attrRegExp) || [];
            for (var aI = 0, aL = attrStr.length; aI < aL; aI++){
               attrBuffer = attrStr[aI].split('=');
               attributes.push({
                  name: attrBuffer[0].replace(/^\s/, ''),
                  value: (attrBuffer[1] || '').replace(attributeQuotes, '')
               });
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
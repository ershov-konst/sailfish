define('js!dom', ['js!Node'], function(Node){
   var
      tagRegExp = /(<\/?[a-z][a-z0-9]*(?::[a-z][a-z0-9]*)?\s*(?:\s+[a-z0-9-_]+=(?:(?:'[\s\S]*?')|(?:"[\s\S]*?")))*\s*\/?>)|([^<]|<(?![a-z\/]))*/gi,
      attrRegExp = /\s[a-z0-9-_]+\b(\s*=\s*('|")[\s\S]*?\2)?/gi,
      startComponent = /^<component/,
      endComponent = /^<\/component>/,
      startTag = /^<[a-z]/,
      selfClose = /\/>$/,
      closeTag = /^<\//,
      nodeName = /<([a-z][a-z0-9]*)(?::([a-z][a-z0-9]*))?/i,
      attributeQuotes = /^('|")|('|")$/g,
      trim = /^\s*|\s*$/g;

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
            document : true,
            childNodes: [],
            parentNode: null
         }),
         buffer,
         currentObject = result,
         tag,
         fullNodeName,
         attrBuffer = [],
         attrStr = [],
         attributes = [];

      for (var i = 0, l = tags.length; i < l; i++){
         tag = tags[i];
         fullNodeName = tag.match(nodeName);

         if (startTag.test(tag)){
            attributes = [];
            attrStr = tag.match(attrRegExp) || [];
            for (var aI = 0, aL = attrStr.length; aI < aL; aI++){
               attrBuffer = attrStr[aI].split('=');
               attributes.push({
                  name: attrBuffer[0].replace(trim, ''),
                  value: (attrBuffer[1] || '').replace(trim, '').replace(attributeQuotes, '')
               });
            }
            currentObject.childNodes.push(buffer = new Node({
               nodeType: 1, //element node
               nodeName : fullNodeName[1],
               namespace : fullNodeName[2],
               attributes: attributes,
               childNodes: [],
               parentNode: currentObject,
               startTag: tag
            }));

            if (currentObject.isDocument() && !currentObject.documentElement){
               currentObject.documentElement = buffer;
            }
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
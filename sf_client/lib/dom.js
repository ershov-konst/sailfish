define('js!dom', ['js!Node', 'js!sax'], function(Node, sax){
   var
      tagRegExp = /(<\/?[a-z][a-z0-9]*\s*(?:\s+[a-z0-9-_]+=(?:(?:'.*?')|(?:".*?")))*\s*\/?>)|([^<]|<(?![a-z\/]))*/gi,
      startComponent = /^<component/,
      endComponent = /^<\/component>/;

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
         result = new Node({
            childNodes: [],
            parentNode: null
         }),
         parser = sax.parser(true),
         attributes = [],
         buffer,
         currentObject = result;

      parser.onerror = function(e){
         throw new Error('Markup parse error! Originnal error:\n' + e);
      };

      parser.ontext = function(text){
         if (currentObject){
            currentObject.childNodes.push(new Node({
               nodeType: 3,
               text: text,
               parentNode: currentObject
            }));
         }
      };

      parser.onopentag = function(node){
         attributes = [];
         for (var i in node.attributes){
            if (node.attributes.hasOwnProperty(i)){
               attributes.push({
                  name: i,
                  value: node.attributes[i]
               });
            }
         }

         currentObject.childNodes.push(buffer = new Node({
            nodeType: 1, //element node
            nodeName : node.name,
            attributes: attributes,
            childNodes: [],
            parentNode: currentObject
         }));
         if (!node.isSelfClosing){
            currentObject = buffer;
         }
      };

      parser.onclosetag = function(){
         currentObject = currentObject.parentNode;
      };

      parser.write(markup).close();

      return result;
   }

   return {
      parse: parse,
      replaceComponents : replaceComponents
   }
});
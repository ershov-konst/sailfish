define(['js!dom'], function(dom){

   describe('configFromXML', function() {
      var
         xml = '<component data-component="test1" singleQuote=\'test2\'>\
                     <foo>bar</foo>\
                     <num>42</num>\
                     <bool>false</bool>\
                     <null>null</null>\
                     <undefined>undefined</undefined>\
                     <object type="object">\
                        <foo>bar</foo>\
                     </object>\
                  </component>',
         xmlObject = dom.parse(xml);

      it('innerHTML', function(){
         expect(xmlObject.innerHTML()).toEqual(xml);
      });

      it('getElementsByTagName', function(){
        expect(xmlObject.getElementsByTagName('foo').length).toEqual(2);
      });

      it('innerText', function(){
         expect(xmlObject.getElementsByTagName('bool')[0].innerHTML()).toEqual('false');
      });

      it('rootElementsCount', function(){
         var count = 0;

         for (var i = 0, l = xmlObject.childNodes.length; i < l; i++){
            if (xmlObject.childNodes[i].nodeType !== 3){
               count++;
            }
         }
         expect(count).toEqual(1);
      });

      it('innerElementCount', function(){
         var
            component = xmlObject.getElementsByTagName('component')[0],
            count = 0;

         for (var i = 0, l = component.childNodes.length; i < l; i++){
            if (component.childNodes[i].nodeType !== 3){
               count++;
            }
         }

         expect(count).toEqual(6);
      });

      it('attributes', function(){
         var
            component = xmlObject.getElementsByTagName('component')[0],
            attrs = component.attributes,
            result = {};

         for (var i in attrs){
            if (attrs.hasOwnProperty(i)){
               result[i] = component.getAttribute(i);
            }
         }

         expect(result, {
            "data-component" : "test1",
            "singleQuote" : "test2"
         });
      });
   });

});
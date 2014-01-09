define(['js!utils'], function(utils){

   describe('parseMarkup', function() {

      it('parseMarkup.simpleTypes', function() {
         var
            element = document.createElement('component'),
            innerHTML = '\
               <o name="foo">bar</o>\
               <o name="num">42</o>\
               <o name="bool">false</o>\
               <o name="null">null</o>\
               <o name="undefined">undefined</o>\
            ',
            res;

         element.setAttribute('name', 'test');
         element.innerHTML = innerHTML;

         res = utils.parseMarkup(element);

         expect(res).toEqual({
            element: element,
            name: 'test',
            foo: 'bar',
            num: 42,
            bool: false,
            null: null,
            undefined: undefined
         });
      });

      it('parseMarkup.array', function() {
         var
            element = document.createElement('component'),
            innerHTML = '\
               <o name="arr" type="array">\
                  <o name="foo">bar</o>\
                  <o name="num">42</o>\
                  <o name="bool">false</o>\
                  <o name="null">null</o>\
                  <o name="undefined">undefined</o>\
               </o>\
            ',
            res;

         element.setAttribute('name', 'test');
         element.innerHTML = innerHTML;

         res = utils.parseMarkup(element);

         expect(res.arr).toEqual([
            'bar',
            42,
            false,
            null,
            undefined
         ]);
      });

      it('parseMarkup.object', function() {
         var
            element = document.createElement('component'),
            innerHTML = '\
               <o name="obj" type="object">\
                  <o name="foo">bar</o>\
                  <o name="num">42</o>\
                  <o name="bool">false</o>\
                  <o name="null">null</o>\
                  <o name="undefined">undefined</o>\
               </o>\
            ',
            res;

         element.setAttribute('name', 'test');
         element.innerHTML = innerHTML;

         res = utils.parseMarkup(element);

         expect(res.obj).toEqual({
            'foo': 'bar',
            'num': 42,
            'bool': false,
            'null': null,
            'undefined': undefined
         });
      });

      it('parseMarkup.objectDeclarationByAttr', function() {
         var
            element = document.createElement('component'),
            innerHTML = '\
               <o name="obj" type="object" foo="bar" num="42" bool="false" null="null" undefined="undefined"></o>\
            ',
            res;

         element.setAttribute('name', 'test');
         element.innerHTML = innerHTML;

         res = utils.parseMarkup(element);

         expect(res.obj).toEqual({
            'name': 'obj',
            'type': 'object',
            'foo': 'bar',
            'num': 42,
            'bool': false,
            'null': null,
            'undefined': undefined
         });
      });

      it('parseMarkup.nestedObjects', function() {
         var
            element = document.createElement('component'),
            innerHTML = '\
               <o name="obj" type="object">\
                  <o name="arr" type="array">\
                     <o type="object" name="obj">\
                     </o>\
                     <o type="object"></o>\
                     <o type="object" foo="bar"></o>\
                     <o type="object" bool="false"></o>\
                  </o>\
                  <o name="obj" type="object" foo="bar" num="42" bool="false" null="null" undefined="undefined"></o>\
               </o>\
            ',
            res;

         element.setAttribute('name', 'test');
         element.innerHTML = innerHTML;

         res = utils.parseMarkup(element);

         expect(res.obj).toEqual({
            'arr': [
               {},
               {
                  type: 'object'
               },
               {
                  type: 'object',
                  foo: 'bar'
               },
               {
                  type: 'object',
                  bool: false
               }
            ],
            'obj': {
               'name': 'obj',
               'type': 'object',
               'foo': 'bar',
               'num': 42,
               'bool': false,
               'null': null,
               'undefined': undefined
            }
         });
      });

      it('parseMarkup.parseAttr', function() {
         var
            element = document.createElement('component'),
            cfg = {
               'name': 'john',
               'foo' : 'bar',
               'num' : 42,
               'html': '<a href="/">that link contains \'quot\' and "double quot"</a>',
               'html2': "<a href='/'>that link contains 'quot' and \"double quot\"</a>"
            },
            res;

         element.setAttribute('config', encodeURIComponent(JSON.stringify(cfg)).replace(/'/g, '&quot;'));

         res = utils.parseMarkup(element);
         delete res.element;

         expect(res).toEqual({
            'name': 'john',
            'foo' : 'bar',
            'num' : 42,
            'html': '<a href="/">that link contains \'quot\' and "double quot"</a>',
            'html2': "<a href='/'>that link contains 'quot' and \"double quot\"</a>"
         });
      });

   });

});
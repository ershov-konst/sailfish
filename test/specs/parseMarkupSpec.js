define(['js!utils'], function(utils){

   describe('parseMarkup', function() {

      it('parseMarkup.simpleTypes', function() {
         var
            innerHTML = '<component id="1" name="test">\
                            <foo>bar</foo>\
                            <num>42</num>\
                            <bool>false</bool>\
                            <null>null</null>\
                            <undefined>undefined</undefined>\
                         </component>',
            res;

         res = utils.parseMarkup(innerHTML);

         expect(res).toEqual({
            id: '1',
            name: 'test',
            foo: 'bar',
            num: 42,
            bool: false,
            null: null,
            undefined: undefined
         });
      });

      it('parseMarkup.array', function() {
         var xml = '<component name="test">\
                        <arr type="array">\
                           <foo>bar</foo>\
                           <num>42</num>\
                           <bool>false</bool>\
                           <null>null</null>\
                           <undefined>undefined</undefined>\
                        </arr>\
                     </component>',
            res;

         res = utils.parseMarkup(xml);

         expect(res.arr).toEqual([
            'bar',
            42,
            false,
            null,
            undefined
         ]);
      });

      it('parseMarkup.object', function() {
         var xml = '<component name="test">\
                       <obj type="object">\
                          <foo>bar</foo>\
                          <num>42</num>\
                          <bool>false</bool>\
                          <null>null</null>\
                          <undefined>undefined</undefined>\
                       </obj>\
                    </component>',
            res;

         res = utils.parseMarkup(xml);

         expect(res.obj).toEqual({
            'foo': 'bar',
            'num': 42,
            'bool': false,
            'null': null,
            'undefined': undefined
         });
      });

      it('parseMarkup.objectDeclarationByAttr', function() {
         var xml = '<component name="test">\
                       <obj type="object" foo="bar" num="42" bool="false" null="null" undefined="undefined"></obj>\
                    </component>',
            res;

         res = utils.parseMarkup(xml);

         expect(res.obj).toEqual({
            'type': 'object',
            'foo': 'bar',
            'num': 42,
            'bool': false,
            'null': null,
            'undefined': undefined
         });
      });

      it('parseMarkup.nestedObjects', function() {
         var xml = '<component name="test">\
                       <obj type="object">\
                          <arr type="array">\
                             <o type="object">\
                             </o>\
                             <o type="object"></o>\
                             <o type="object" foo="bar"></o>\
                             <o type="object" bool="false"></o>\
                          </arr>\
                          <obj type="object" foo="bar" num="42" bool="false" null="null" undefined="undefined"></obj>\
                       </obj>\
                    </component>',
            res;

         res = utils.parseMarkup(xml);

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
            markup,
            cfg = {
               'name': 'john',
               'foo' : 'bar',
               'num' : 42,
               'html': '<a href="/">that link contains \'quot\' and "double quot"</a>',
               'html2': "<a href='/'>that link contains 'quot' and \"double quot\"</a>"
            },
            res;

         markup = "<component id='2' config='"+ utils.encodeConfig(cfg) +"' />";
         res = utils.parseMarkup(markup);

         expect(res).toEqual({
            'id': '2',
            'name': 'john',
            'foo' : 'bar',
            'num' : 42,
            'html': '<a href="/">that link contains \'quot\' and "double quot"</a>',
            'html2': "<a href='/'>that link contains 'quot' and \"double quot\"</a>"
         });
      });

   });

});
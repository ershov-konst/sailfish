define('js!test.package', {
   handler: function(){
      alert(1);
   }
});
define(['js!utils', 'js!dom', 'js!test.package'], function(utils, dom){

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
            xmlObject = dom.parse(innerHTML).documentElement,
            res;

         res = utils.parseMarkup(xmlObject);

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
                        <arr:array>\
                           <foo>bar</foo>\
                           <num>42</num>\
                           <bool>false</bool>\
                           <null>null</null>\
                           <undefined>undefined</undefined>\
                        </arr>\
                     </component>',
            xmlObject = dom.parse(xml).documentElement,
            res;

         res = utils.parseMarkup(xmlObject);

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
                       <obj:object>\
                          <foo>bar</foo>\
                          <num>42</num>\
                          <bool>false</bool>\
                          <null>null</null>\
                          <undefined>undefined</undefined>\
                       </obj>\
                    </component>',
            xmlObject = dom.parse(xml).documentElement,
            res;

         res = utils.parseMarkup(xmlObject);

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
                       <obj:object foo="bar" num="42" bool="false" null="null" undefined="undefined"></obj>\
                    </component>',
            xmlObject = dom.parse(xml).documentElement,
            res;

         res = utils.parseMarkup(xmlObject);

         expect(res.obj).toEqual({
            'foo': 'bar',
            'num': 42,
            'bool': false,
            'null': null,
            'undefined': undefined
         });
      });

      it('parseMarkup.nestedObjects', function() {
         var xml = '<component name="test">\
                       <obj:object>\
                          <arr:array>\
                             <o:object>\
                             </o>\
                             <o:object></o>\
                             <o:object foo="bar"></o>\
                             <o:object bool="false"></o>\
                          </o>\
                          <obj:object foo="bar" num="42" bool="false" null="null" undefined="undefined"></o>\
                       </obj>\
                    </component>',
            xmlObject = dom.parse(xml).documentElement,
            res;

         res = utils.parseMarkup(xmlObject);

         expect(res.obj).toEqual({
            'arr': [
               {},
               {},
               {
                  foo: 'bar'
               },
               {
                  bool: false
               }
            ],
            'obj': {
               'foo': 'bar',
               'num': 42,
               'bool': false,
               'null': null,
               'undefined': undefined
            }
         });
      });

      it('parseMarkup.fn', function(){
         var xml = '<component name="test">\
                       <handler:fn>js!test.package:handler</handler>\
                    </component>',
            xmlObject = dom.parse(xml).documentElement,
            res;

         res = utils.parseMarkup(xmlObject);

         expect(res.handler === require('js!test.package')['handler']).toBeTruthy();
      });

      it('parseMarkup.complicatedMarkup', function() {
         var xml = '<component id="123" data-component="docs.Sidebar" name="menu">\
                        <activeLink>/qs/example</activeLink>\
                        <items:array>\
                           <o:object>\
                              <caption>Quick start</caption>\
                              <submenu:array>\
                                 <o:object caption="Install" href="/qs/install"></o>\
                                 <o:object caption="Usage" href="/qs/example"></o>\
                              </submenu>\
                           </o>\
                        </items>\
                     </component>',
            xmlObject = dom.parse(xml).documentElement,
            res;

         res = utils.parseMarkup(xmlObject);
         expect(res).toEqual({
            "name": "menu",
            "id": "123",
            "activeLink": "/qs/example",
            "items": [
               {
                  "caption": "Quick start",
                  "submenu": [
                     {
                        "caption": "Install",
                        "href": "/qs/install"
                     },
                    {
                       "caption": "Usage",
                       "href": "/qs/example"
                    }
                  ]
               }
            ]});
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
            xmlObject,
            res;

         markup = "<component id='2' config='"+ utils.encodeConfig(cfg) +"' />";
         xmlObject = dom.parse(markup).documentElement;
         res = utils.parseMarkup(xmlObject);

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
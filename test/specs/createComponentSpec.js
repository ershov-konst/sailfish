define('html!test.Component', ['doT'], function(doT){
   var markup = '<div class="test-Component"><span class="test-Component__valueContainer">{{=it.value}}</span></div>';
   return doT.template(markup);
});

define('js!test.Component', ['js!BaseComponent', 'html!test.Component'], function(BaseComponent, doTfn){
   return BaseComponent.extend({
      _dotTplFn: doTfn
   });
});

define('html!test.ParentComponent', ['doT'], function(doT){
   var markup = '<div class="test-ParentComponent"><span class="test-ParentComponent__wr">{{=it.content}}</span></div>';
   return doT.template(markup);
});

define('js!test.ParentComponent', ['js!CompoundComponent', 'html!test.ParentComponent', 'js!test.Component'], function(CompoundComponent, doTfn){
   return CompoundComponent.extend({
      _dotTplFn: doTfn,
      getChildControlsCount: function(){
         var count = 0;
         for (var i in this._components){
            if (this._components.hasOwnProperty(i)){
               count++;
            }
         }
         return count;
      }
   });
});

define(['js!utils', 'js!test.Component', 'js!test.ParentComponent'], function(utils, constr, parentConstr){

   describe('withoutMarkup', function(){
      var
         element = document.createElement('div');

      element.setAttribute('data-component', 'test.Component');
      element.setAttribute('config', utils.encodeConfig({value: 42}));
      document.body.appendChild(element);

      var component = new constr(element);

      it('outerHTML', function(){
         var container = component.container();
         expect(container.outerHTML).toEqual('<div class="test-Component"><span class="test-Component__valueContainer">42</span></div>');
      })
   });


   describe('withMarkup', function(){
      var
         element = document.createElement('div');

      element.setAttribute('class', 'test-Component');
      element.setAttribute('data-component', 'test.Component');
      element.setAttribute('config', utils.encodeConfig({value: 42}));
      element.innerHTML = '<span class="test-Component__valueContainer">42</span>';

      var component = new constr(element);

      document.body.appendChild(element);

      it('outerHTML', function(){
         var container = component.container();
         expect(container.outerHTML).toEqual('<div class="test-Component"><span class="test-Component__valueContainer">42</span></div>');
      })
   });

   describe('optionsWithElement', function(){
      var
         element = document.createElement('div'),
         component = new constr({
            element: element,
            value: 42
         });

      it('outerHTML', function(){
         var container = component.container();
         expect(container.outerHTML).toEqual('<div class="test-Component"><span class="test-Component__valueContainer">42</span></div>');
      })
   });

   describe('optionsWithoutElement', function(){
      var component = new constr({
         value: 42
      });

      it('outerHTML', function(){
         var container = component.container();
         expect(container.outerHTML).toEqual('<div class="test-Component"><span class="test-Component__valueContainer">42</span></div>');
      })
   });

   describe('nestedMarkup', function(){
      var markup = '\
      <component id="4224" data-component="test.ParentComponent" class="some-class" some-attr="attrValue">\
         <content type="html">\
            <component data-component="test.Component">\
                <value>42</value>\
             </component>\
         </content>\
      </component>\
      ';

      var result = parentConstr.prototype._prepareMarkup.apply(parentConstr.prototype, [markup]),
         elem = document.createElement('div');

      elem.innerHTML = result;

      document.body.appendChild(elem);

      it('parentMarkup', function(){
         expect(elem.getElementsByClassName('test-ParentComponent').length).toEqual(1)
      });
      it('childMarkup', function(){
         expect(elem.getElementsByClassName('test-Component').length).toEqual(1)
      });
      it('childHTML', function(){
         expect(elem.getElementsByClassName('test-Component__valueContainer')[0].innerHTML).toEqual('42')
      });
      it('id', function(){
         expect(elem.getElementsByClassName('test-ParentComponent')[0].getAttribute('id')).toEqual('4224');
      });
      it('parentId', function(){
         var
            parent = elem.getElementsByClassName('test-ParentComponent')[0],
            child  = elem.getElementsByClassName('test-Component')[0];

         expect(parent.getAttribute('id')).toEqual(child.getAttribute('data-pid'))
      });
      it('additionalAttr', function(){
         expect(elem.getElementsByClassName('test-ParentComponent')[0].getAttribute('some-attr')).toEqual('attrValue');
      });
      it('class', function(){
         expect(elem.getElementsByClassName('test-ParentComponent')[0].getAttribute('class')).toEqual('some-class test-ParentComponent')
      });

      it('_components', function(){
         var c = new parentConstr(elem.getElementsByClassName('test-ParentComponent')[0]);
         expect(c.getChildControlsCount()).toEqual(1);
      });
   });
});
define('html!test.Child', ['doT'], function(doT){
   var markup = '<div class="test-Child"><ul>{{ for(var i = 0, l = it.list.length; i < l; i++){ }}<li>{{=it.list[i]}}</li>{{}}}</ul></div>';
   return doT.template(markup);
});
define('js!test.Child', ['js!BaseComponent', 'html!test.Child'], function(BaseComponent, dotTplFn){
   return BaseComponent.extend({
      _dotTplFn: dotTplFn,
      getElemCount: function(){
         return this._container.getElementsByTagName('li').length;
      },
      getList: function(){
         return this._options.list;
      },
      callFn: function(){
         return this._options.fn();
      }
   });
});
define('html!test.Parent', ['doT'], function(doT){
   var markup = '<div class="test-Parent"><component data-component="test.Child" name="child"><list:ref>{{@it.list}}</list><fn:ref>{{@it.fn}}</fn></component></div>';
   return doT.template(markup);
});
define('js!test.Parent', ['js!CompoundComponent', 'html!test.Parent', 'js!test.Child'], function(CompoundComponent, dotTplFn){
   return CompoundComponent.extend({
      _dotTplFn: dotTplFn,
      getChild: function(){
         return this._components['child'];
      }
   });
});

define(['js!test.Parent'], function(Parent){
   describe('useParentOptions', function(){
      it('simple', function(){
         var
            list = [1,2,3,4,5,6,7,8,9],
            parent = new Parent({
               list : list
            }),
            child = parent.getChild();

         expect(child.getList()).toEqual(list);

         expect(child.getElemCount()).toEqual(list.length);
      });

      it('fn', function(){
         var
            list = [],
            fn = function(){
               return 42;
            };
         var parent = new Parent({
               list : list,
               fn : fn
            }),
            child = parent.getChild();

         expect(child.callFn()).toEqual(42);
      });
   });
});

define('html!test.Child', ['doT'], function(doT){
   var markup = '<div class="test-Child"><ul>{{ for(var i = 0, l = it.list.length; i < l; i++){ }}<li>{{=it.list[i]}}</li>{{}}}</ul></div>';
   return doT.template(markup);
});
define('js!test.Child', ['js!BaseComponent', 'html!test.Child'], function(BaseComponent, dotTplFn){
   return BaseComponent.extend({
      _dotTplFn: dotTplFn,
      getElemCount: function(){
         return this._container.getElementsByTagName('li').length;
      }
   });
});
define('html!test.Parent', ['doT'], function(doT){
   var markup = '<div class="test-Parent"><component data-component="test.Child" name="child"><list:ref>{{@it.list}}</list></component></div>';
   return doT.template(markup);
});
define('js!test.Parent', ['js!CompoundComponent', 'html!test.Parent', 'js!test.Child'], function(CompoundComponent, dotTplFn){
   return CompoundComponent.extend({
      _dotTplFn: dotTplFn,
      getElemCount: function(){
         return this._components['child'].getElemCount();
      }
   });
});

define(['js!test.Parent'], function(Parent){
   describe('useParentOptions', function(){
      it('simple', function(){
         var
            list = [1,2,3,4,5,6,7,8,9];
         var parent = new Parent({
               list : list
            });

         expect(parent.getElemCount()).toEqual(list.length);
      });
   });
});

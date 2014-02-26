define('js!BaseComponent', ['js!utils', 'js!Abstract', 'js!dom'], function(utils, Abstract, dom){

   var global = (function(){return this || (0,eval)('this')})();
   global.require = require;

   return Abstract.extend({
      _dotTplFn : null,
      _container : null,
      _options : {
         element: null,
         name : ''
      },
      init : function(cfg){
         this._super(cfg);

         switch (utils.type(cfg)){
            case 'element':
               utils.extend(true, this._options, utils.parseOptions(cfg));
               this._container = cfg;
               break;
            case 'object':
               utils.extend(true, this._options, cfg);
               this._container = cfg.element;
               break;
            default:
               throw new Error('can`t resolve options');
         }

         var buffer;
         //have the opportunity to build a markup
         if (this._dotTplFn){
            //is no markup yet
            if (!this._hasMarkup(this._container)){
               var tmp = document.createElement('body');

               tmp.innerHTML = this._buildMarkup(this._dotTplFn, this._options);
               buffer = tmp.firstChild;

               if (this._container && this._container.parentNode){
                  this._container.parentNode.replaceChild(tmp.firstChild, this._container);
               }
            }
            else {
               buffer = this._container;
            }

            this._container = buffer;
         }
      },
      container : function(){
         return this._container;
      },
      name : function(){
         return this._options.name;
      },

      _prepareMarkup: function(markup, parentId){
         var
            componentType = '',
            options = {},
            constructor = null,
            parsedOptions = {};

         try{
            //try to parse component type
            componentType = /data-component=('|")([^'"]*)\1/.exec(markup)[2];
            //get constructor
            constructor = global.require('js!' + componentType);
         }
         catch (e){
            throw new Error('can`t resolve component type. Markup: \n' + markup);
         }

         if (constructor){
            if (typeof constructor.prototype._dotTplFn == 'function'){
               //parse configuration
               parsedOptions = utils.parseMarkup(markup);
               utils.extend(true, options, constructor.prototype._options, parsedOptions);

               markup = this._buildMarkup(constructor.prototype._dotTplFn, options);

               //append important attributes
               markup = markup.replace(/^<\/?[a-z][a-z0-9]*/, function(start){
                  var attributes = " config='"+ utils.encodeConfig(parsedOptions) +"' hasmarkup='true' ";
                  if (options.id){
                     attributes += ("id='"+ options.id +"' ")
                  }
                  if (parentId){
                     attributes += ("data-pid='"+ parentId +"' ");
                  }
                  return start + attributes;
               })
            }
         }

         return markup;
      },
      _buildMarkup: function(dotTplFn, options){
         var
            self = this,
            markup;

         //create markup
         markup = dotTplFn(options);
         //inline inner components
         return dom.replaceComponents(markup, function(componentStr){
            return self._prepareMarkup(componentStr, options.id);
         });
      },
      _hasMarkup: function(container){
         return container && container.getAttribute && container.getAttribute('hasmarkup') == 'true';
      },
      _removeContainer : function(){
         var
            parent = this._container.parentNode;

         parent.removeChild(this._container);
      },
      destroy : function(){
         this._removeContainer();
         this._super();
      }
   });
});
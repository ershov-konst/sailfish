define("js!BaseComponent", ["js!utils", "js!Abstract"], function(utils, Abstract){

   return Abstract.extend({
      _dotTplFn : null,
      _container : null,
      _options : {
         name : ""
      },
      init : function(cfg){
         this._super(cfg);

         if (cfg instanceof Node){
            this._container = cfg;
            this._options = this._parseCfg(this._options, cfg);
         }

         if (this._dotTplFn){
            this._createMarkup(this._container);
         }

         this._container.removeAttribute("config");
         this._container.setAttribute("id", this._id = utils.generateId());
      },
      container : function(){
         return this._container;
      },
      name : function(){
         return this._options.name;
      },
      _createMarkup : function(){
         if (!this._container || !/sf-has-markup/.test(this._container.className)){
            var
               e,
               container = document.createElement("div"),
               parentNode = this._container ? this._container.parentNode : undefined;

            container.innerHTML = this._dotTplFn(this._options);
            e = this._prepareContainer(this._container ? this._container : undefined, container.childNodes[0]);

            if (parentNode){
               parentNode.replaceChild(e, this._container);
            }

            this._container = e;
         }
      },
      _prepareContainer : function(placeholder, element){
         element.setAttribute("class", element.getAttribute("class") + " sf-has-markup");
         if (placeholder){
            element.setAttribute("data-component", placeholder.getAttribute("data-component"));
         }
         if (typeof window == "undefined"){
            var name = placeholder.getAttribute("name");
            if (name){
               element.setAttribute("name", name);
            }
            element.setAttribute("config", placeholder.getAttribute("config"));
         }
         return element;
      },
      _removeContainer : function(){
         var
            parent = this._container.parentNode;

         parent.removeChild(this._container);
      },
      _parseCfg : function(options, cfg){
         var
            res = {},
            parsed = utils.parseMarkup(cfg);
         utils.extend(true, res, options, parsed);
         return res;
      },
      _decodeConfig: function(encodedCfg){
         var result;

         try{
            result = JSON.parse(decodeURIComponent(encodedCfg.replace(/&quot;|"/g,'\'')));
         }
         catch(e){
            throw new Error("Ошибка разбор конфигурации для компонента");
         }
         return result;
      },
      destroy : function(){
         this._removeContainer();
         this._super();
      }
   });
});
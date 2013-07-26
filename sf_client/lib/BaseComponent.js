define("js!BaseComponent", ["js!core", "js!Abstract"], function(core, Abstract){

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
         this._container.setAttribute("id", this._id = this._generateId());
      },
      container : function(){
         return this._container;
      },
      name : function(){
         return this._options.name;
      },
      _createMarkup : function(){
         if (!this._container || !/ws-has-markup/.test(this._container.className)){
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
         element.setAttribute("class", element.getAttribute("class") + " ws-has-markup");
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
         var res = {};
         core.extend(true, res, options, JSON.parse(cfg.getAttribute("config") || "{}"));
         res.name = cfg.getAttribute("name") || cfg.name;
         return res;
      },
      destroy : function(){
         this._removeContainer();
         this._super();
      }
   });
});
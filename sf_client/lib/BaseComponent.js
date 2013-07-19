define("js!BaseComponent", ["js!core", "js!Abstract"], function(core, Abstract){

   return Abstract.extend({
      _dotTplFn : null,
      _container : null,
      _options : {
         name : ""
      },
      init : function(cfg){
         this._super(cfg);

         this._parseCfg(cfg);



         if (this._dotTplFn){
            this._createMarkup();
         }
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
            e = container.childNodes[0];

            if (parentNode){
               parentNode.replaceChild(e, this._container);
            }

            this._container = e;
            this._container.className = this._container.className + " ws-has-markup";
            this._container.setAttribute("data-component", this._container.localName);
         }
      },
      _removeContainer : function(){
         var
            parent = this._container.parentNode;

         parent.removeChild(this._container);
      },
      _parseCfg : function(cfg){
         if (cfg instanceof Node){
            this._container = cfg;
            core.extend(true, this._options, JSON.parse(cfg.getAttribute("config") || "{}"));
            this._options.name = cfg.getAttribute("name") || cfg.name;
         }
      },
      destroy : function(){
         this._removeContainer();
         this._super();
      }
   });
});
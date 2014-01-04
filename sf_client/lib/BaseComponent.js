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
            parsed = this._parseMarkup(cfg);
         utils.extend(true, res, options, parsed);
         return res;
      },
      _parseMarkup : function(cfg){
         function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
         }
         function parseElem(elem){
            var result;

            if (elem.nodeType === 3){ //TEXT_NODE
               //если это любой непробейльный символ - считаем что это часть контента, иначе скорее всего перевод строки - пропускаем
               result = /\S/.test(elem.textContent) ? {name : "content", value : elem.textContent} : false;
            }
            else if (elem.localName == "option"){
               var obj = {};
               obj["name"] = elem.getAttribute("name");
               obj["value"]= elem.getAttribute("value");

               if (elem.innerHTML.length){
                  obj["value"] = elem.innerHTML.trim();
               }

               if (isNumber(obj["value"])){
                  //is number
                  obj["value"] = parseFloat(obj["value"]);
               }
               else if (obj["value"] === "false"){
                  //is boolean "false"
                  obj["value"] = false;
               }
               else if (obj["value"] === "true"){
                  //is boolean "true"
                  obj["value"] = true;
               }

               result = obj;
            }
            else if (elem.localName == "options"){
               var
                  isArray = /Array|array/.test(elem.getAttribute("type")),
                  res = isArray ? [] : {},
                  childRes,
                  childNodes = elem.childNodes;

               if (!isArray){
                  for (var aI = 0, attrs = elem.attributes, aL = attrs.length; aI < aL; aI++){
                     res[attrs[aI]["name"]] = attrs[aI]["value"];
                  }
               }

               for (var i = 0, l = childNodes.length; i < l; i++){
                  if ((childRes = parseElem(childNodes[i])) !== false){
                     if (isArray){
                        res.push(childRes["value"]);
                     }
                     else{
                        if(childRes["name"] == "content" && res["content"]){
                           res["content"] += childRes["value"];
                        }
                        else{
                           res[childRes["name"]] = childRes["value"];
                        }
                     }
                  }
               }

               result =  {
                  "name" : elem.getAttribute("name") || "Object",
                  "value": res
               }
            }
            else if ("outerHTML" in elem){
               result = {name : "content", value : elem.outerHTML};
            }

            return result;
         }

         if (cfg && typeof cfg.cloneNode === "function"){
            var obj, childNodes;

            obj = (typeof cfg.getAttribute === "function") ? this._decodeConfig(cfg.getAttribute('config') || '{}') : {};
            cfg.removeAttribute('config');

            obj.name = ((typeof cfg.getAttribute === "function") ? cfg.getAttribute("name") : null)
               || obj.name || "";

            childNodes = cfg.childNodes;

            if (childNodes.length){
               for (var i = 0, l = childNodes.length; i < l; i++){
                  var field = parseElem(childNodes[i]);
                  if (field){
                     if (field["name"] == "content"){
                        obj["content"] = obj["content"] || "";
                        obj["content"] += field["value"];
                     }
                     else{
                        obj[field["name"]] = field["value"];
                     }
                  }
               }
            }
         }

         return obj;
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
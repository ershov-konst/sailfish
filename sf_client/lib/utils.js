/**
 * @module js!utils
 */
define("js!utils", function(){

   function getTagName(elem) {
      //IE8 DOM localName is undefined, checking nodeName instead.
      return elem.localName || (elem.nodeName && elem.nodeName.toLowerCase());
   }


   function getChildNodes(elem){
      var doc = null;
      if (elem.innerHTML && typeof window !== 'undefined' && window.ActiveXObject){
         doc = new ActiveXObject('Microsoft.XMLDOM');
         doc.async = false;
         doc.loadXML('<doc>' + elem.innerHTML + '</doc>');
         doc = doc.documentElement;
      }
      else{
         doc = elem;
      }
      if (!doc){
         throw new Error('Ошибка разбора конфигурации компонента! Configuration:\n' + elem.innerHTML);
      }
      return doc.childNodes;
   }

   function resolveType(value){

      if (stringIsNumber(value)){
         value = parseFloat(value, 10);
      }

      switch (value){
         case 'false':
            value = false;
            break;
         case 'true':
            value = true;
            break;
         case 'null':
            value = null;
            break;
         case 'undefined':
            value = undefined;
            break;
         default:
            break;
      }
      return value;
   }

   function stringIsNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
   }


   function parseElem(elem){
      var result;

      if (elem.nodeType === 3){ //TEXT_NODE
         //если это любой непробельный символ - считаем, что это часть контента, иначе скорее всего перевод строки - пропускаем
         result = /\S/.test(elem.textContent) ? {name : 'content', value : elem.textContent} : false;
      }
      else if (getTagName(elem) == 'o') {
         if (/Object|object|Array|array/.test(elem.getAttribute('type'))){
            var
               isArray = /Array|array/.test(elem.getAttribute('type')),
               res = isArray ? [] : {},
               childRes,
               childNodes = elem.childNodes;

            if (!isArray && !childNodes.length){
               for (var aI = 0, attrs = elem.attributes, aL = attrs.length; aI < aL; aI++){
                  res[attrs[aI].name] = resolveType(attrs[aI].value);
               }
            }

            for (var i = 0, l = childNodes.length; i < l; i++){
               if ((childRes = parseElem(childNodes[i])) !== false){
                  if (isArray){
                     res.push(childRes.value);
                  }
                  else{
                     if(childRes.name == 'content' && res.content){
                        res.content += childRes.value;
                     }
                     else{
                        res[childRes.name] = childRes.value;
                     }
                  }
               }
            }

            result =  {
               'name' : elem.getAttribute('name') || 'Object',
               'value': res
            }
         }
         else{
            var
               obj = {},
               content = elem.innerHTML || elem.text || "";

            obj.name = elem.getAttribute('name');
            obj.value= elem.getAttribute('value');

            if (content.length){
               obj.value = content.replace(/^\s+|\s+$/g, "");
            }

            obj.value = resolveType(obj.value);

            result = obj;
         }
      }
      else if ('outerHTML' in elem){
         result = {name : "content", value : elem.outerHTML};
      }

      return result;
   }

   function decodeConfig(encodedCfg){
      var result;

      try{
         result = JSON.parse(decodeURIComponent(encodedCfg.replace(/&quot;|"/g,'\'')));
      }
      catch(e){
         throw new Error("Ошибка разбор конфигурации для компонента");
      }
      return result;
   }



   /**
    * Basic tools for working framework
    *
    * **Module returns**: `js!utils`
    * @namespace {Object} utils
    */
   var utils = {};

   /**
    * Provide inner components, returns array of instantiated components
    * @param {HTMLElement} root Element that may contains components
    * @param {String} [parentId] Id of parent container
    * @returns {Array}
    * @memberof utils
    */
   utils.provideInnerComponents = function(root, parentId){
      var
         collection,
         result = [];

      function _getCollection (root, parentId){
         var
            selector = parentId ? '[data-component][data-pid="'+ parentId +'"]' : '[data-component]',
            components = root.querySelectorAll(selector),
            deadCollection = [];

         for (var i = 0, l = components.length; i < l; i++){
            if (parentId){
               result.push(components[i]);
            }
            else {
               var p = components[i];
               while(p = p.parentNode){
                  if (p === root){
                     deadCollection.push(components[i]);
                     break;
                  }
                  else if(/sf-has-markup/.test(p.className)){
                     break;
                  }
               }
            }
         }

         return deadCollection;
      }

      collection = _getCollection(root, parentId);

      for (var i = 0, l = collection.length; i < l; i++){
         var cName = collection[i].getAttribute("data-component");

         result.push(new (require("js!" + cName))(collection[i]));
      }
      return result;
   };

   /**
    * main method for run application
    * @param {Array} deps dependencies for start application
    * @memberof utils
    */
   utils.bootUp = function(deps){
      require(deps, function(){
         utils.provideInnerComponents(document.body);
      });
   };

   /**
    * Like a jQuery merge
    * Merge the contents of two or more objects together into the first object
    * @param {Boolean} [deep] If true, the merge becomes recursive (aka. deep copy)
    * @param {Object} target The object to extend. It will receive the new properties.
    * @param {Object} object1 An object containing additional properties to merge in
    * @param {Object} [objectN] Additional objects containing properties to merge in.
    * @returns {Object}
    * @memberof utils
    */
   utils.extend = function() {
      var options, name, src, copy, copyIsArray, clone,
         target = arguments[0] || {},
         i = 1,
         length = arguments.length,
         deep = false,
      //helper which replicates the jquery internal functions
         objectHelper = {
            hasOwn: Object.prototype.hasOwnProperty,
            class2type: {},
            type: function (obj) {
               return obj == null ?
                  String(obj) :
                  objectHelper.class2type[ Object.prototype.toString.call(obj) ] || "object";
            },
            isPlainObject: function (obj) {
               if (!obj || objectHelper.type(obj) !== "object" || obj.nodeType || objectHelper.isWindow(obj)) {
                  return false;
               }

               try {
                  if (obj.constructor && !objectHelper.hasOwn.call(obj, "constructor") && !objectHelper.hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                     return false;
                  }
               } catch (e) {
                  return false;
               }

               var key;
               for (key in obj) {
               }

               return key === undefined || objectHelper.hasOwn.call(obj, key);
            },
            isArray: Array.isArray || function (obj) {
               return objectHelper.type(obj) === "array";
            },
            isFunction: function (obj) {
               return objectHelper.type(obj) === "function";
            },
            isWindow: function (obj) {
               return obj != null && obj == obj.window;
            }
         };  // end of objectHelper

      // Handle a deep copy situation
      if (typeof target === "boolean") {
         deep = target;
         target = arguments[1] || {};
         // skip the boolean and the target
         i = 2;
      }

      // Handle case when target is a string or something (possible in deep copy)
      if (typeof target !== "object" && !objectHelper.isFunction(target)) {
         target = {};
      }

      // If no second argument is used then this can extend an object that is using this method
      if (length === i) {
         target = this;
         --i;
      }

      for (; i < length; i++) {
         // Only deal with non-null/undefined values
         if ((options = arguments[ i ]) != null) {
            // Extend the base object
            for (name in options) {
               src = target[ name ];
               copy = options[ name ];

               // Prevent never-ending loop
               if (target === copy) {
                  continue;
               }

               // Recurse if we're merging plain objects or arrays
               if (deep && copy && ( objectHelper.isPlainObject(copy) || (copyIsArray = objectHelper.isArray(copy)) )) {
                  if (copyIsArray) {
                     copyIsArray = false;
                     clone = src && objectHelper.isArray(src) ? src : [];

                  } else {
                     clone = src && objectHelper.isPlainObject(src) ? src : {};
                  }

                  // Never move original objects, clone them
                  target[ name ] = utils.extend(deep, clone, copy);

                  // Don't bring in undefined values
               } else if (copy !== undefined) {
                  target[ name ] = copy;
               }
            }
         }
      }

      // Return the modified object
      return target;
   };

   /**
    * type checking by Jon Bretman
    * @param {*} o
    * @return {String}
    * @memberof utils
    * @example
    *
    *     utils.type('str') //returns 'string'
    */
   utils.type = function(o){
      // handle null in old IE
      if (o === null) {
         return 'null';
      }
      if (o === undefined){
         return 'undefined';
      }

      // handle DOM elements
      if (o && (o.nodeType === 1 || o.nodeType === 9)) {
         return 'element';
      }

      var s = Object.prototype.toString.call(o);
      var type = s.match(/\[object (.*?)\]/)[1].toLowerCase();

      // handle NaN and Infinity
      if (type === 'number') {
         if (isNaN(o)) {
            return 'nan';
         }
         if (!isFinite(o)) {
            return 'infinity';
         }
      }

      return type;
   };
   /**
    * Generate an random id
    * @returns {string}
    * @memberof utils
    */
   utils.generateId = function(){
      return Math.random().toString(36).substring(7);
   };

   /**
    * Parse configuration from html element declaration
    * @param {HTMLElement} cfg HTMLElement contained config declared by html
    * @returns {Object}
    */
   utils.parseMarkup = function(cfg){

      if (cfg && cfg.cloneNode){ // Bugfix. IE8 type of DOM elements functions == "object".
         var
            obj,
            childNodes;

         try{
            obj = cfg.getAttribute ? decodeConfig(cfg.getAttribute('config') || '{}') : {};
         }
         catch(e){
            throw new Error('parseMarkup: parse error!');
         }

         obj.name = (cfg.getAttribute ? cfg.getAttribute('name') : null)
            || obj.name || '';
         obj.element = cfg;
         cfg = obj;

         if (cfg.element.getAttribute('hasMarkup') !== 'true'){
            childNodes = getChildNodes(cfg.element);
            if (childNodes.length){
               for (var i = 0, l = childNodes.length; i < l; i++){
                  var field = parseElem(childNodes[i]);
                  if (field){
                     if (field.name == 'content'){
                        cfg.content = cfg.content || '';
                        cfg.content += field.value;
                     }
                     else{
                        cfg[field.name] = field.value;
                     }
                  }
               }
            }
         }
      }

      return obj;
   };

   return utils;
});

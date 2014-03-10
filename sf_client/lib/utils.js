/**
 * @module js!utils
 */
define('js!utils', ['js!dom'], function(dom){

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
         result = /\S/.test(elem.text) ? {name : 'content', value : elem.text} : false;
      }
      else {
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
               'name' : elem.nodeName,
               'value': res
            }
         }
         else if (/HTML|html/.test(elem.getAttribute('type'))){
            result = {name : elem.nodeName, value : elem.innerHTML()};
         }
         else{
            var
               obj = {},
               content = elem.innerHTML();

            obj.name = elem.nodeName;
            obj.value= elem.getAttribute('value');

            if (content.length){
               obj.value = content.replace(/^\s+|\s+$/g, "");
            }

            obj.value = resolveType(obj.value);

            result = obj;
         }
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
    * @param {Object} xmlObject faked xmlElement
    * @returns {Object}
    */
   utils.parseMarkup = function(xmlObject){
      var
         obj,
         childNodes;

      obj = utils.parseConfigAttr(xmlObject);

      obj.name = xmlObject.getAttribute('name') || obj.name || '';
      obj.id   = xmlObject.getAttribute('id')   || obj.id   || utils.generateId();

      if (xmlObject.getAttribute('hasMarkup') !== 'true'){
         childNodes = xmlObject.childNodes;
         if (childNodes.length){
            for (var i = 0, l = childNodes.length; i < l; i++){
               var field = parseElem(childNodes[i]);
               if (field){
                  if (field.name == 'content'){
                     obj.content = obj.content || '';
                     obj.content += field.value;
                  }
                  else{
                     obj[field.name] = field.value;
                  }
               }
            }
         }
      }

      return obj;
   };

   utils.parseConfigAttr = function(container){
      var result = {};
      try{
         result = utils.decodeConfig(container.getAttribute('config') || '{}');
      }
      catch(e){
         throw new Error('parse options error: \n' + e);
      }
      return result;
   };

   utils.decodeConfig = function(encodedCfg){
      var result;

      try{
         result = JSON.parse(decodeURIComponent(encodedCfg.replace(/&quot;|"/g,'\'')));
      }
      catch(e){
         throw new Error("Ошибка разбор конфигурации для компонента");
      }
      return result;
   };

   utils.encodeConfig = function(json){
      return encodeURIComponent(JSON.stringify(json)).replace(/'/g, '&quot;');
   };

   function getStr(v, storage){
      var result = '';
      if (v instanceof Array){
         if (!v.length){
            result = '[]';
         }
         else{
            result = '[';
            for (var i = 0, l = v.length; i < l; i++){
               result += getStr(v[i], storage);
            }
            result += ']';
         }
      }
      else if (Object.prototype.toString.call(v) == '[object Object]'){
         result = '{';
         var firstProperty = true;
         for (var n in v){
            if (v.hasOwnProperty(n)){
               if (!firstProperty){
                  result += ',';
               }
               else{
                  firstProperty = false;
               }
               result += '"' + n + '":' + getStr(v[n], storage);
            }
         }
         result += '}';
      }
      else if (v instanceof Date){
         result = 'new Date('+ (+v) +')';
      }
      else if (v instanceof RegExp){
         var flags =
            (v.multiline  ? 'm' : '') +
            (v.global     ? 'g' : '') +
            (v.ignoreCase ? 'i' : '');

         result = 'new RegExp("'+ v.source +'","'+ flags +'")'
      }
      else if (typeof(v) == 'function'){
         result = 'this.storage[' + storage.length + ']';
         storage.push(v);
      }
      else if (typeof(v) == 'string'){
         result = '"' + v + '"';
      }
      else {
         result = '' + v;
      }
      return result;
   }

   utils.deepCopyFn = function(toCopy){
      var
         context = {
            storage : []
         },
         fn = new Function('return ' + getStr(toCopy, context.storage) + ';');
      return function(){
         return fn.apply(context, arguments);
      }
   };

   return utils;
});

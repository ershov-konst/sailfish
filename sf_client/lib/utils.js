/**
 * js!utils
 *
 * Basic tools for working framework
 */
define("js!utils", function(){
   var utils = {};

   /**
    * Provide inner components
    * @param {HTMLElement} root that may contains components
    * @param {String} [parentId] id of parent container
    * @returns {Array} array of instantiated components
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
    */
   utils.type = function(o){
      if (o && o.nodeType === 1){
         return 'element';
      }

      var match = Object.prototype.toString.call(o).match(/\[object (.*?)\]/);
      var _type = match[1].toLowerCase();

      if (_type === 'number' && isNaN(o)){
         return 'nan';
      }

      return _type;
   };
   /**
    * Generate an random id
    * @returns {string}
    */
   utils.generateId = function(){
      return Math.random().toString(36).substring(7);
   }
});

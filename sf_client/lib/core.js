define("js!core", function(){
   var core;
   return core = {
      provideInnerElements : function(root){
         var
            collection,
            result = {};

         function _getCollection (root){
            var
               components = root.querySelectorAll("[data-component]"),
               deadCollection = [];

            for (var i = 0, l = components.length; i < l; i++){
               if (components[i].localName == "component"){
                  deadCollection.push(components[i]);
               }
               else{
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

         collection = _getCollection(root);

         for (var i = 0, l = collection.length; i < l; i++){
            var
               cName = collection[i].getAttribute("data-component"),
               inst = new (require("js!" + cName))(collection[i]),
               name = inst.name();
            if (name){
               result[name] = inst;
            }
         }
         return result;
      },
      bootUp : function(deps){
         require(deps, function(){
            core.provideInnerElements(document.body);
         });
      },
      /**
       * https://github.com/dansdom/extend
       * @returns {*|{}}
       */
      extend : function() {
         var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false,
         // helper which replicates the jquery internal functions
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
                     target[ name ] = core.extend(deep, clone, copy);

                     // Don't bring in undefined values
                  } else if (copy !== undefined) {
                     target[ name ] = copy;
                  }
               }
            }
         }

         // Return the modified object
         return target;
      }
   }
});

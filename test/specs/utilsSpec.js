define(['js!utils'], function(utils){

   describe('utils', function() {

      it('utils.type', function() {
         var
            res = [],
            types = {
               'null'   : null,
               'undefined': {}.a,
               'object' : {foo: 1},
               'array'  : [1,2,3],
               'string' : 'str',
               'number' : 1,
               'boolean': true,
               'function': function(){},
               'regexp' : /./,
               'date' : new Date(),
               'element': document.createElement('div'),
               'nan' : NaN,
               'infinity': 1/0
            };

         for (var i in types){
            if (types.hasOwnProperty(i)){
               res.push(utils.type(types[i]));
            }
         }

         expect(res).toEqual(Object.keys(types));
      });

   });

   describe('deepCloneFn', function(){

      it('NaN', function(){
         var
            toClone = {nan : NaN},
            cloneFn = utils.deepCopyFn(toClone),
            clone = cloneFn();

         expect(clone.nan).toBeNaN();
      });

      it('EmptyString', function(){
         utils.deepCopyFn({id : ''});
         var
            toClone = {id : ''},
            cloneFn = utils.deepCopyFn(toClone),
            clone = cloneFn();

         expect(clone).toEqual(toClone);
      });

      it ('simpleType', function(){
         var
            toClone = {
               'null' : null,
               'undefined' : {}.a,
               'string' : 'str',
               'number' : 1,
               'boolean' : true,
               'regexp' : /./gim,
               'date' : new Date(),
               'infinity' : 1/0
            },
            deepCopyFn = utils.deepCopyFn(toClone),
            clone = deepCopyFn();

         expect(clone).toEqual(toClone);
      });

      it ('deepClone', function(){
         var
            toClone = {
               'null' : null,
               'undefined' : {}.a,
               'string' : 'str',
               'number' : 1,
               'boolean' : true,
               'regexp' : /./gim,
               'date' : new Date(),
               'infinity' : 1/0,
               'object' : {
                  a : {
                     'null' : null,
                     'undefined' : {}.a,
                     'string' : 'str',
                     'number' : 1,
                     'boolean' : true,
                     'regexp' : /./gim,
                     'date' : new Date(),
                     'infinity' : 1/0
                  },
                  b : [
                     {
                        'null' : null,
                        'undefined' : {}.a,
                        'string' : 'str',
                        'number' : 1,
                        'boolean' : true,
                        'regexp' : /./gim,
                        'date' : new Date(),
                        'infinity' : 1/0,
                        'object' : {
                           a : {
                              'null' : null,
                              'undefined' : {}.a,
                              'string' : 'str',
                              'number' : 1,
                              'boolean' : true,
                              'regexp' : /./gim,
                              'date' : new Date(),
                              'infinity' : 1/0
                           },
                           b : [
                              {
                                 'null' : null,
                                 'undefined' : {}.a,
                                 'string' : 'str',
                                 'number' : 1,
                                 'boolean' : true,
                                 'regexp' : /./gim,
                                 'date' : new Date(),
                                 'infinity' : 1/0
                              }
                           ]
                        }
                     }
                  ]
               }
            },
            cloneFn = utils.deepCopyFn(toClone),
            clone = cloneFn();

         expect(clone).toEqual(toClone);
      });

      it ('functions', function(){

         var
            globalVar = 42,
            toClone = {
               fn : function(){
                  return globalVar + 1;
               },
               fn1: function(){
                  return this.fn() + 1;
               }
            },
            cloneFn = utils.deepCopyFn(toClone),
            clone = cloneFn();

         expect(clone.fn()).toEqual(43);
         expect(clone.fn1()).toEqual(44);
      })
   });

});
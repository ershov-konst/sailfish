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

});
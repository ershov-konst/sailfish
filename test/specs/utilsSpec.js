define(['js!utils'], function(utils){

   describe('utils.type', function() {

      it('string', function() {
         expect(utils.type('str')).toEqual('string');
      });

   });

});
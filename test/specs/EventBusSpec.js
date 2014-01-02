define(['js!EventBus'], function(EventBus){

   describe('EventBus', function() {

      it('EventBus.channel', function() {
         var
            ch1 = EventBus.channel('test'),
            ch2 = EventBus.channel('test');

         expect(ch1 == ch2).toBeTruthy();
      });

      it('EventBus.removeChannel', function(){
         var
            ch1 = EventBus.channel('test2'),
            ch2;
         EventBus.removeChannel('test2');
         ch2 = EventBus.channel('test2');

         expect(ch1 == ch2).not.toBeTruthy();
      });

      it('EventBusChannel.simpleSubscribe', function(){
         var
            sum = 0,
            ch = EventBus.channel('test3');

         ch.on('SimpleEvent', function(){
            sum += 2;
         });

         ch.trigger('SimpleEvent');

         expect(sum).toEqual(2);
      });

      it('EventBusChannel.arguments', function(){
         var
            sum = 0,
            ch = EventBus.channel('test4');

         ch.on('SimpleEvent', function(event, a, b, c){
            sum += (a + b + c);
         });

         ch.trigger('SimpleEvent', 1, 2, 3);

         expect(sum).toEqual(6);
      });

      it('EventBusChannel.multiSubscribe', function(){
         var
            sum = 0,
            ch = EventBus.channel('test5');

         ch.on('SimpleEvent', function(){
            sum += 2;
         });

         ch.on('SimpleEvent', function(){
            sum += 4;
         });

         ch.trigger('SimpleEvent');

         expect(sum).toEqual(6);
      });

      it('EventBusChannel.stopPropagation', function(){
         var
            sum = 0,
            ch = EventBus.channel('test6');

         ch.on('SimpleEvent', function(){
            sum += 2;
            return false;
         });

         ch.on('SimpleEvent', function(){
            sum += 4;
         });

         ch.trigger('SimpleEvent');

         expect(sum).toEqual(2);
      });

      it('EventBusChannel.off', function(){
         var
            sum = 0,
            ch = EventBus.channel('test7'),
            handler1 = function(){
               sum += 2;
            },
            handler2 = function(){
               sum += 4;
            };

         ch.on('SimpleEvent', handler1);

         ch.on('SimpleEvent', handler2);

         ch.off('SimpleEvent', handler2);

         ch.trigger('SimpleEvent');

         expect(sum).toEqual(2);
      });

      it('EventBusChannel.ctx', function(){
         var
            ctx = {
               foo: 0,
               bar: 1
            },
            ch = EventBus.channel('test8');

         ch.on('SimpleEvent', function(){
            this.foo += 2;
         }, ctx);

         ch.on('SimpleEvent', function(){
            this.bar += 2;
         }, ctx);

         ch.trigger('SimpleEvent');

         expect(ctx).toEqual({foo: 2, bar: 3});
      });

      it('EventBusChannel.has', function(){
         var
            sum = 0,
            ch = EventBus.channel('test9'),
            handler1 = function(){
               sum += 2;
            };

         ch.on('SimpleEvent', handler1);

         expect(ch.has('SimpleEvent', handler1)).toBeTruthy();
      });

      it('EventBusChannel.hasWithCtx', function(){
         var
            sum = 0,
            ctx = {
               foo: 'bar'
            },
            ch = EventBus.channel('test10'),
            handler1 = function(){
               sum += 2;
            };

         ch.on('SimpleEvent', handler1, ctx);

         expect(ch.has('SimpleEvent', handler1, ctx)).toBeTruthy();
      });

   });

});
define("core", function(){
   return {
      bootUp : function(deps, comps){
         require(deps, function(){
            var components = {};
            for (var i = 0, l = deps.length; i < l; i++){
               var
                  liveCollection = document.getElementsByTagNameNS("sf-component", deps[i].split("!")[1]),
                  deadCollection = [];

               for (var le = 0, leL = liveCollection.length; le < leL; le++){
                  deadCollection.push(liveCollection[le]);
               }

               for (var de = 0, deL = deadCollection.length; de < deL; de++){
                  var
                     comp = new (arguments[i])(deadCollection[de]),
                     name = comp.getName();
                  if (name){
                     components[name] = comp;
                  }
               }
            }
            if (comps.length){
               require(comps, function(){
                  for (var i = 0, l = arguments.length; i < l; i++){
                     arguments[i](components);
                  }
               });
            }
         });

      }
   }
});

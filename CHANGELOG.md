## v.0.0.17
* reduced memory leaks
* fixed problems with EventBusChannel for Component instances
* update dependencies
* minor fixes

## v.0.0.16
* `js!CompoundComponent` added method getComponentByName

    CompoundComponent.prototype.getComponentByName(name{String})
    
* migration to less-middleware: "1.0.x", async: "0.9.x", mkdirp: "0.5.x"

## v0.0.15
* doT template engine now available from sailfish. `require('sailfish').doT`
* migration to async: "0.8.x, mkdirp: "0.4.x"

## v0.0.13
* dom.js - improved dom parsing
* added the ability to pass functions as a component options
* migration to commander:"2.2.x", async:"0.7.x", less:"1.7.x", mkdirp: "0.3.x"
* migration to karma:"0.12.x"
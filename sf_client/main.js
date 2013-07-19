requirejs.config({
   separateCSS : true,
   optimize: "none",
   paths : {
      "path-resolver" : "sf_client/ext/requirejs/plugins/path-resolver",
      "js"            : "sf_client/ext/requirejs/plugins/js",
      "css"           : "sf_client/ext/requirejs/plugins/css",
      "html"          : "sf_client/ext/requirejs/plugins/html",
      "css-normalize" : "sf_client/ext/requirejs/plugins/css-normalize",
      "css-builder"   : "sf_client/ext/requirejs/plugins/css-builder",
      "doT"           : "sf_client/ext/dot/doT",
      "text"          : "sf_client/ext/requirejs/plugins/text"
   }
});
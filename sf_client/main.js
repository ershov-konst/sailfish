requirejs.config({
   baseUrl: 'sf_client',
   separateCSS : true,
   paths : {
      "path-resolver" : "ext/requirejs/plugins/path-resolver",
      "js" : "ext/requirejs/plugins/js",
      "css" : "ext/requirejs/plugins/css",
      "html" : "ext/requirejs/plugins/html",
      "css-normalize" : "../ext/requirejs/plugins/css-normalize",
      "r-css" : "../ext/requirejs/plugins/r-css",
      "css-builder" : "../ext/requirejs/plugins/css-builder",
      "css-path-resolver" : "../ext/requirejs/plugins/css-path-resolver"
   }
});
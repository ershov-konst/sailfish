var tests = [];
for (var file in window.__karma__.files) {
   if (window.__karma__.files.hasOwnProperty(file)) {
      if (/Spec\.js$/.test(file)) {
         tests.push(file);
      }
   }
}

requirejs.config({
   // Karma serves files from '/base'
   baseUrl: '/base',

   paths: {
      'path-resolver': 'sf_client/ext/requirejs/plugins/path-resolver',
      'js': 'sf_client/ext/requirejs/plugins/js',
      'css': 'sf_client/ext/requirejs/plugins/css',
      'html': 'sf_client/ext/requirejs/plugins/html',
      'css-normalize': 'sf_client/ext/requirejs/plugins/css-normalize',
      'css-builder': 'sf_client/ext/requirejs/plugins/css-builder',
      'doT': 'sf_client/ext/dot/doT',
      'text': 'sf_client/ext/requirejs/plugins/text',
      'is': 'sf_client/ext/requirejs/plugins/is',
      'is-api': 'sf_client/ext/requirejs/plugins/is-api',
      'is-builder': 'sf_client/ext/requirejs/plugins/is-builder'
   },

   // ask Require.js to load these files (all our tests)
   deps: tests,

   // start test run, once Require.js is done
   callback: window.__karma__.start
});
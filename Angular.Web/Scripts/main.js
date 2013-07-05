// Require JS  Config File

require.config({
	paths : {
	    "angular": "lib/angular/angular",
	    "underscore" : "lib/underscore",
	},
	shim : {
		angular  :{
			exports : "angular"
		},
		underscore: {
		    exports : "_"
		}
	},
	packages: [
        'services',
	    'controllers'
	]
});

require([
    'angular',
    'app'
], function (angular, app) {
    var html = angular.element(document).find('html');
    angular.bootstrap(html, [app.name]);
});

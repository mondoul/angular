// Require JS  Config File

require.config({
	paths : {
		"angular" : "lib/angular/angular"
	},
	shim : {
		angular  :{
			exports : "angular"
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

// Require JS  Config File

require.config({
	paths : {
	    "angular": "lib/angular/angular",
	    "underscore": "lib/underscore",
	    "jquery": "lib/jquery-1.10.2",
	    "observable": "lib/observable",
	    "signalr": "lib/jquery.signalR-1.1.3"
	},
	shim : {
		angular  :{
			exports : "angular"
		},
		underscore: {
		    exports : "_"
		},
		signalr: {
		    exports : "$",
		    deps:["jquery"]
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

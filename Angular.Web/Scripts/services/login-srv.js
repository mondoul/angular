define(function () {
    
    function loginSrvFactory($window, $http) {

        return {
            login: function(user) {
                return p;

            },

            hello: function() {
                $window.alert('hello');
            }
        };
    }

    loginSrvFactory.$inject = ['$window', '$q', '$http'];

    return loginSrvFactory;
});

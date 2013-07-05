define(function () {
    
    function uploadSrvFactory($window, $http) {

        return {
            login: function(user) {
                return p;

            },

            hello: function() {
                $window.alert('hello');
            }
        };
    }

    uploadSrvFactory.$inject = ['$window', '$q', '$http'];

    return uploadSrvFactory;
});

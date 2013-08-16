define(function () {
    
    function fileSrvFactory($rootScope, $http, $window) {
        
        return {
            getFiles: function (id) {
                return $http({ method: 'GET', url: url.ApplicationName + '/api/files/get', params: { id: id } });
            },
            getSingleFile: function (clientId, id) {
                $window.open(url.ApplicationName + '/upload/get?shareId=' + clientId + '&fileId=' + id);
            },
        };
    }

    fileSrvFactory.$inject = ['$rootScope', '$http', '$window'];

    return fileSrvFactory;
});

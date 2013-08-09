define(function () {
    
    function fileSrvFactory($rootScope, $http, $window) {
        
        return {
            getFiles: function (id) {
                return $http({ method: 'GET', url: '/angular/api/files/get', params: { id: id } });
            },
            getSingleFile: function (clientId, id) {
                $window.open('/angular/upload/get?shareId=' + clientId + '&fileId=' + id);
            },
        };
    }

    fileSrvFactory.$inject = ['$rootScope', '$http', '$window'];

    return fileSrvFactory;
});

define(function () {
    
    function fileSrvFactory($rootScope, $http) {
        
        return {
            getFiles: function (id) {
                return $http({ method: 'GET', url: '/angular/api/files', params: { id: id } });
            },
            getSingleFile:function(filename, id) {
            },
        };
    }

    fileSrvFactory.$inject = ['$rootScope', '$http'];

    return fileSrvFactory;
});

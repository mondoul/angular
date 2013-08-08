define(['jquery'], function ($) {

    /* 
     * TODO 
     *  - permettre le téléchargement de fichier (lorsque l'upload est terminé)
     *  - mettre à disposition un zip contenant tous les fichiers
     */

    function filesController($scope, $rootScope, $location, clientSrv, fileSrv, _) {

        $scope.files = [];
        $scope.name = '';
        $scope.clientId = '';
        $scope.loaderVisible = true;

        $scope.progress = {};

        $scope.init = function (guid) {
            $scope.clientId = guid;
            fileSrv.getFiles($scope.clientId)
                .success(function (data) {
                    $scope.files = data.Files;
                    $scope.name = data.Name;
                    clientSrv.initClientConnection($scope.clientId);
                    $scope.loaderVisible = false;
                    $.each($scope.files, function(index, item) {
                        if (!$scope.progress[item.Name])
                            $scope.progress[item.Name] = {
                                style: item.IsUploaded ? { 'width': '100%' } : { 'width': '0%' },
                                progress: item.IsUploaded ? 'progress-bar-success' : ''
                            };
                    });
                })
                .error(function (data, status) {
                    $scope.loaderVisible = false;
                    console.log(data);
                    $location.path('/404');
                });
        };

        $scope.class = function(filename) {
            return $scope.progress[filename] ? $scope.progress[filename].progress : '';
        };

        $scope.style = function (filename) {
            return $scope.progress[filename] ? $scope.progress[filename].style : {};
        };
        
        $rootScope.$on('fileUploadProgress', function (e, call) {
            $scope.progress[call.item].style = { 'width': call.progress + '%' };
            if (call.progress == 100) {
                $scope.progress[call.item].progress = 'progress-bar-success';
            }
        });
    }

    filesController.$inject = ['$scope', '$rootScope', '$location', 'clientSrv', 'fileSrv', '_'];

    return filesController;
});
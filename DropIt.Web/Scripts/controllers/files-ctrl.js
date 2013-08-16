define(['jquery'], function ($) {

    /* 
     * TODO 
     *  - (LOW) mettre à disposition un zip contenant tous les fichiers 
     */

    function filesController($scope, $rootScope, $location, clientSrv, fileSrv, _) {

        $scope.files = [];
        $scope.downloadedFiles = [];
        $scope.name = '';
        $scope.clientId = '';
        $scope.loaderVisible = true;

        $scope.progress = {};

        $scope.init = function (guid) {
            $scope.clientId = guid;
            fileSrv.getFiles($scope.clientId)
                .success(function (data) {
                    $scope.files = _.filter(data.Files, function (file) {
                        return file.IsDownloaded == false;
                    });
                    $scope.downloadedFiles = _.filter(data.Files, function (file) {
                        return file.IsDownloaded == true;
                    });
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
                    if (!$rootScope.$$phase) {
                        $rootScope.$apply();
                    }
                })
                .error(function (data, status) {
                    $scope.loaderVisible = false;
                    console.log(data);
                    $location.path('/404');
                });
        };

        $scope.linkStyle = function (file) {
            if (file.IsUploaded) {
                return { cursor: 'pointer' };
            } else {
                return { cursor: 'default' };
            }
        };
        
        $scope.progressClass = function (filename) {
            return $scope.progress[filename] ? $scope.progress[filename].progress : '';
        };

        $scope.download = function (file) {
            if (file.IsUploaded) {
                fileSrv.getSingleFile($scope.clientId, file.Id);
                $scope.downloadedFiles.push(file);
                removeFile(file.Name);
            }
        };

        $scope.style = function (filename) {
            return $scope.progress[filename] ? $scope.progress[filename].style : {};
        };
        
        $rootScope.$on('fileUploadProgress', function (e, call) {
            $scope.progress[call.item].style = { 'width': call.progress + '%' };
            if (call.progress == 100) {
                $scope.progress[call.item].progress = 'progress-bar-success';
                var file = _.find($scope.files, function (f) {
                    return f.Name == call.item;
                });
                file.IsUploaded = true;
            }
        });
        
        $rootScope.$on('fileRemove', function (e, call) {
            removeFile(call.item);
        });
        
        function removeFile(filename) {
            $scope.files = _.reject($scope.files, function (file) { return file.Name == filename; });
        }
    }

    filesController.$inject = ['$scope', '$rootScope', '$location', 'clientSrv', 'fileSrv', '_'];

    return filesController;
});
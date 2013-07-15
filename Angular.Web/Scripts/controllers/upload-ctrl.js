define(function () {

    function uploadController($scope, $rootScope, uploadSrv, _) {

        $scope.files = [];
        $scope.started = false;
        $scope.progress = [];

        $scope.upload = function () {
            if ($scope.files.length > 0) {
                $scope.started = true;
                $scope.resetProgress();
                uploadSrv.upload($scope.files);
            }
        };

        $scope.resetProgress = function() {
            for (var i = 0; i < $scope.files.length; i++) { 
                $scope.progress[$scope.files[i].name] = 0;
            }
        };

        $scope.fileChange = function (e) {
            var files = e.target.files; // todo : drag & drop with : e.dataTransfer.files;
            for (var i = 0; i < files.length; i++) {
                if (_.contains($scope.files, $scope.files[i])) continue;
                $scope.files.push(files[i]);
            }
        };

        $rootScope.$on('fileUploadProgress', function (e, call) {
            var args = call;
        });
        
        $rootScope.$on('fileStatusUpdate', function (e, call) {
            var args = call;
        });
    }

    uploadController.$inject = ['$scope', '$rootScope', 'uploadSrv', '_'];

    return uploadController;
});
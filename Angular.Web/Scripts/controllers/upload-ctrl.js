define(function () {

    function uploadController($scope, $rootScope, uploadSrv, _) {

        $scope.files = [];
        $scope.percentage = 0;

        $scope.upload = function () {
            if ($scope.files.length > 0)
                uploadSrv.upload();
        };

        $scope.fileChange = function (e) {
            var files = e.target.files; // todo : drag & drop with : e.dataTransfer.files;
            for (var i = 0; i < files.length; i++) {
                if (_.contains($scope.files, $scope.files[i])) continue;
                $scope.files.push(files[i]);
            }
        };
    }

    uploadController.$inject = ['$scope', '$rootScope', 'uploadSrv', '_'];

    return uploadController;
});
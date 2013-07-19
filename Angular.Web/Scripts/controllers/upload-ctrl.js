define(['jquery'], function ($) {

    /* 
     * TODO 
     *  - gérer l'upload concurrentiel avec des webworker HTML5
     *  - gérer le retry & le style en cas d'echec de l'upload
     *  - rendre tout ça beau...
     */

    function uploadController($scope, $rootScope, uploadSrv, _) {

        $scope.files = [];
        $scope.started = false;
        $scope.progress = [];
        $scope.fileIndex = 0;
        
        $scope.getFileDisplay = function(filename) {
            var display = filename;
            if ($scope.progress[filename]) {
                display = display + ' - ' + $scope.progress[filename].status;
            }
            return display;
        };

        $scope.upload = function () {  
            if ($scope.files.length > 0) {
                $scope.started = true;
                $scope.resetProgress();
                uploadSrv.uploadAll();
            }
        };

        $scope.resetProgress = function() {
            for (var i = 0; i < $scope.files.length; i++) {
                if (!$scope.progress[$scope.files[i].name])
                    $scope.progress[$scope.files[i].name] = { status : 'Ready', style: { 'width' : '0%' } };
            }
        };

        $scope.fileDrag = function(e) {
            e.stopPropagation();
            e.preventDefault();
            if (e.type == 'dragover')
                $("#filedrag").addClass('hover');
            else 
                $("#filedrag").removeClass('hover');
            
        };

        $scope.fileChange = function (e) {
            $scope.fileDrag(e);
            
            var files = e.target.files || e.dataTransfer.files;
            for (var i = 0; i < files.length; i++) {
                if (_.some($scope.files, function(f) { return f.name == files[i].name; })) continue;
                $scope.files.push(files[i]);
                uploadSrv.add(files[i], $scope.fileIndex++);
            }
        };

        $scope.removeFile = function(filename) {
            $scope.files = _.reject($scope.files, function(f) {
                return f.name == filename;
            });
            uploadSrv.remove(filename);
        };

        $scope.style = function (item) {
            return $scope.progress[item] ? $scope.progress[item].style : {};
        };

        $rootScope.$on('fileUploadProgress', function (e, call) {
            $scope.progress[call.item].style = { 'width': call.progress + '%' };
        });
        
        $rootScope.$on('fileStatusUpdate', function (e, call) {
            $scope.progress[call.item].status = call.message;
        });
    }

    uploadController.$inject = ['$scope', '$rootScope', 'uploadSrv', '_'];

    return uploadController;
});
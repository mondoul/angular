define(['jquery'], function ($) {

    /* 
     * TODO 
     *  - gérer l'upload concurrentiel avec des webworker HTML5
     */

    function uploadController($scope, $rootScope, uploadSrv, _) {

        $scope.files = [];
        $scope.started = false;
        $scope.displayAlert = false;
        $scope.progress = {};
        $scope.fileIndex = 0;

        $scope.from = '';
        $scope.to = '';
        $scope.message = '';
        $scope.targetUrl = '';

        $scope.getFileDisplay = function(filename) {
            var display = filename;
            if ($scope.progress[filename]) {
                display = display + ' - ' + $scope.progress[filename].status;
            }
            return display;
        };

        $scope.isUploadSuccessful = function() {
            return _.size($scope.progress) > 0 && _.every($scope.progress, function (elt) {
                return elt.uploaded == true && elt.failed == false;
            });
        };

        $scope.isUploadTerminated = function() {
            var isTerminated = _.size($scope.progress) > 0 &&
                               ($scope.isUploadSuccessful() ||
                               _.every($scope.progress, function(elt) {
                                   return elt.uploaded || elt.failed;
                               }));
            if (isTerminated) $scope.started = false;
            return isTerminated;
        };

        $scope.uploadStatus = function (trigger) {
            var status = {};
            if ($scope.isUploadTerminated() && $scope.isUploadSuccessful()) {
                status.style = 'btn-success disabled';
                status.title = 'Uploaded';
            } else if ($scope.isUploadTerminated() && !$scope.isUploadSuccessful()) {
                status.style = 'btn-warning';
                status.title = 'Retry';
            } else if ($scope.started) {
                status.style = 'btn-primary disabled';
                status.title = 'Upload in progress';
            } else {
                status.style = 'btn-primary';
                status.title = 'Upload';
            }
            if (trigger == 'style')
                return status.style;
            else
                return status.title;
        };
        
        $scope.upload = function () {  
            if ($scope.files.length > 0) {
                $scope.started = true;
                uploadSrv.uploadAll();
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
                if (!$scope.progress[files[i].name])
                    $scope.progress[files[i].name] =
                        {
                            status: 'Ready',
                            style: { 'width': '0%' },
                            progress: '',
                            uploaded: false,
                            failed: false
                        };
                uploadSrv.add(files[i], $scope.fileIndex++);
            }
            if (files.length > 0 && $scope.started) // if upload in progress
                uploadSrv.uploadAll();
        };

        $scope.removeFile = function(filename) {
            $scope.files = _.reject($scope.files, function(f) {
                return f.name == filename;
            });
            delete $scope.progress[filename];
            uploadSrv.remove(filename);
        };

        $scope.share = function() {
            var shareModel = {
                Files: _.map($scope.files, function (file) {
                    return file.name;
                }),
                From: $scope.from,
                To: $scope.to,
                Message: $scope.message
            };
            $scope.upload();
            $.ajax({
                url: 'angular/Upload/SendFiles',
                data: { requestBody : JSON.stringify(shareModel) },
                type: 'POST'
            })
                .done(function (data) {
                    $scope.targetUrl = data;
                    $scope.displayAlert = true;
                    $scope.$apply();
                })
                .fail(function () {
                    $scope.targetUrl = 'http://you-failed.hard';
                    $scope.displayAlert = true;
                    $scope.$apply();
                });
        };

        $scope.style = function (item) {
            return $scope.progress[item] ? $scope.progress[item].style : {};
        };

        $scope.class = function(item) {
            return $scope.progress[item] ? $scope.progress[item].progress : '';
        };

        $rootScope.$on('fileUploadProgress', function (e, call) {
            $scope.progress[call.item].style = { 'width': call.progress + '%' };
            if (call.progress == 100) {
                $scope.progress[call.item].progress = 'progress-success';
                $scope.progress[call.item].uploaded = true;
                $scope.progress[call.item].failed = false;
            }
        });
        
        $rootScope.$on('fileStatusUpdate', function (e, call) {
            $scope.progress[call.item].status = call.message;
        });

        $rootScope.$on('fileUploadError', function (e, call) {
            $scope.progress[call.item].progress = 'progress-warning';
            $scope.progress[call.item].status = 'Please try again';
            $scope.progress[call.item].failed = true;
        });
    }

    uploadController.$inject = ['$scope', '$rootScope', 'uploadSrv', '_'];

    return uploadController;
});
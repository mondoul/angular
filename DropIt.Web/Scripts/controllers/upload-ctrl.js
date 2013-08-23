define(['jquery'], function ($) {

    /* 
     * TODO 
     *  - gérer l'upload concurrentiel avec des webworker HTML5
     *  - fallback pour les vieux navigateurs
     * (1) - Lorsqu'on upload avant de partager, le fichier n'est jamais marqué comme uploadé. Donc il ne peut pas etre téléchargé
     * (2) - empecher de quitter la page lorsqu'un upload est en cours
     * (2) - 
     */

    function uploadController($scope, $rootScope, uploadSrv, clientSrv, _) {

        var emailRegexp = /^((\w+\+*\-*)+\.?)+@((\w+\+*\-*)+\.?)*[\w-]+\.[a-z]{2,6}$/i;

        $scope.files = [];
        $scope.started = false;
        $scope.displayAlert = false;
        $scope.displaySuccess = false;
        $scope.progress = {};
        $scope.fileIndex = 0;
        $scope.shared = false;
        $scope.shareLoaderVisible = false;

        $scope.formErrors = {
            'from': '', 'to': '', 'message': '',
            hasErrors: function() {
                return !isEmpty($scope.formErrors['from']) || !isEmpty($scope.formErrors['to']) || !isEmpty($scope.formErrors['message']);
            },
            validateInpus: function() {
                validateField('from', emailRegexp);
                validateField('to', emailRegexp);
                validateField('message', /.*/);
            }
        };

        $scope.from = '';
        $scope.to = '';
        $scope.message = '';
        $scope.targetUrl = '';
        $scope.shareId = '';
        $scope.notifyDownload = false;

        $scope.init = function (guid) {
            $scope.shareId = guid;
            clientSrv.initServerConnection($scope.shareId);
        };

        function validateField(field, regex) {
            if (isEmpty($scope[field]) || !regex.test($scope[field]))
                $scope.formErrors[field] = 'has-error';
            else
                $scope.formErrors[field] = '';
        }

        $scope.validate = function(e) {
            switch (e.target.id) {
                case 'inputName':
                    validateField('from', emailRegexp);
                    break;
                case 'inputEmail':
                    validateField('to', emailRegexp);
                    break;
                case 'inputMessage':
                    validateField('message', /.*/);
                    break;
            }
        };
        
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
            var status = { style:'', title:''};
            if ($scope.isUploadTerminated() && $scope.isUploadSuccessful()) {
                status.style = 'btn-success disabled';
                status.title = 'Uploaded';
            } else if ($scope.isUploadTerminated() && !$scope.isUploadSuccessful()) {
                status.style = 'btn-warning';
                status.title = 'Retry';
            } else if ($scope.started) {
                status.style = 'btn-primary disabled';
                status.title = 'Upload in progress';
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
            if ($scope.shared) return;
            $scope.fileDrag(e);
            var files = e.target.files || (e.dataTransfer && e.dataTransfer.files)
                                       || (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files);
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
            if ($scope.shared) {
                $.ajax({
                    url: url.ApplicationName + '/api/files/remove',
                    type: 'POST',
                    data: { SendModelId: $scope.shareId, Name: filename }
                });
                clientSrv.sendRemoveFile(filename);
            }
        };

        $scope.share = function () {
            $scope.formErrors.validateInpus();
            if ($scope.formErrors.hasErrors())
                return;
            $scope.shareLoaderVisible = true;
            var shareModel = {
                Guid: $scope.shareId,
                Files: _.map($scope.files, function (file) {
                    return { Name : file.name, Size : file.size };
                }),
                From: $scope.from,
                To: $scope.to,
                Message: $scope.message,
                NotifyWhenDownloadComplete: $scope.notifyDownload
            };
            $scope.upload();
            $.ajax({
                url: url.ApplicationName + '/api/files/share',
                data: JSON.stringify(shareModel),
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json'
            })
                .done(function (data) {
                    $scope.targetUrl = data;
                    $scope.displaySuccess = true;
                    $scope.displayAlert = false;
                    $scope.shared = true;
                    $scope.$apply();
                })
                .fail(function (data) {
                    //console.log(data);
                    $scope.displayAlert = true;
                    $scope.displaySuccess = false;
                    $scope.$apply();
                })
                .always(function() {
                    $scope.shareLoaderVisible = false;
                    if (!$rootScope.$$phase) {
                        $rootScope.$apply();
                    }
                });
        };
        
        $scope.buttonClass = function () {
            if (!$scope.shared) {
                return $scope.files.length > 0 && !$scope.formErrors.hasErrors() ? 'btn-primary' : 'btn-primary disabled';
            } else {
                return 'btn-success disabled';
            }
        };

        $scope.buttonText = function() {
            return $scope.shared ? 'Shared :)' : 'Share my files !'
        };

        $scope.style = function (item) {
            return $scope.progress[item] ? $scope.progress[item].style : {};
        };

        $scope.progressClass = function (item) {
            return $scope.progress[item] ? $scope.progress[item].progress : '';
        };

        $rootScope.$on('fileUploadProgress', function (e, call) {
            $scope.progress[call.item].style = { 'width': call.progress + '%' };
            if (call.progress == 100) {
                $scope.progress[call.item].progress = 'progress-bar-success';
                $scope.progress[call.item].uploaded = true;
                $scope.progress[call.item].failed = false;
                $.ajax({
                    url: url.ApplicationName + '/upload/complete',
                    data: { SendModelId: $scope.shareId, Name: call.item },
                    type: 'POST'
                });
            }
            clientSrv.sendProgressUpdate(call.item, call.progress);
        });
        
        $rootScope.$on('fileStatusUpdate', function (e, call) {
            $scope.progress[call.item].status = call.message;
        });

        $rootScope.$on('fileUploadError', function (e, call) {
            $scope.progress[call.item].progress = 'progress-bar-warning';
            $scope.progress[call.item].status = 'Please try again';
            $scope.progress[call.item].failed = true;
        });
        
        function isEmpty (value) {
            return _.isUndefined(value) || _.isNull(value) ||
                   _.isNaN(value) || _.isEmpty(value.toString());
        }
    }

    uploadController.$inject = ['$scope', '$rootScope', 'uploadSrv', 'clientSrv',  '_'];

    return uploadController;
});

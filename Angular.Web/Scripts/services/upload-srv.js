define(function () {
    
    function uploadSrvFactory($rootScope, chunkFileFactory) {
        
        var files = [];

        var displayStatusMessage = function(filename, message) {
            $rootScope.$broadcast('fileStatusUpdate', { item: filename, message: message });
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        };
        
        var updateProgress = function(filename, progress) {
            $rootScope.$broadcast('fileUploadProgress', { item: filename, progress: progress });
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        };
        
        var uploadError = function (filename, message) {
            $rootScope.$broadcast('fileUploadError', { item: filename, message: message });
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }
        };
        
        return {
            add:function(newFile, index) {
                var chunkedFile = chunkFileFactory.getNewChunkedFile(newFile, index);
                chunkedFile.on('displayStatus', displayStatusMessage);
                chunkedFile.on('updateProgress', updateProgress);
                chunkedFile.on('uploadError', uploadError);
                files.push(chunkedFile);
            },
            remove:function(filename) {
                files = _.reject(files, function (f) {
                    return f.name == filename;
                });
            },
            uploadAll: function() {
                for (var j = 0; j < files.length; j++) {
                    if (files[j].isUploaded || files[j].isUploading) continue;
                    files[j].uploadMetaData();
                }
            },
            isUploadComplete: function() {
                return _.every(files, function(f) {
                    return f.isUploaded;
                });
            }
        };
    }

    uploadSrvFactory.$inject = ['$rootScope', 'chunkFileSrv'];

    return uploadSrvFactory;
});

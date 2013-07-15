define(function () {
    
    function uploadSrvFactory($rootScope, $http) {
        
        var files = [];

        function ChunkedFile(file, index)
        {
            this.maxRetries = 3;
            this.blockLength = 1048576;
            this.numberOfBlocks = 1;
            this.currentChunk = 1;
            this.retryAfterSeconds = 3;
            this.fileToBeUploaded = file;
            this.size = file.size;
            this.fileIndex = index;
            this.name = file.name;
            this.isUploaded = false;
        };

        var uploadMetaData = function(file) {
            file.numberOfBlocks = Math.ceil(file.size / file.blockLength);
            file.currentChunk = 1;

            $http({
                method: 'POST',
                url: '/Upload/SetMetadata?blocksCount=' + file.numberOfBlocks
                    + '&fileName=' + file.name
                    + '&fileSize=' + file.size
                    + '&fileIndex=' + file.fileIndex,
            }).success(function(data) {
                if (data.success == true) {
                    displayStatusMessage(file, 'Starting upload');
                    sendFile(file);
                }
            }).error(function() {
                this.displayStatusMessage(file, "Failed to send MetaData");
            });
        };

        var displayStatusMessage = function(file, message) {
            $rootScope.$broadcast('fileStatusUpdate', new { item: file, message: message });
        };

        var sendFile = function(file) {
            var start = 0,
                end = Math.min(file.blockLength, file.fileToBeUploaded.size),
                retryCount = 0,
                sendNextChunk, fileChunk;
            
            this.displayStatusMessage(file, '');

            sendNextChunk = function() {
                fileChunk = new FormData();

                if (file.fileToBeUploaded.slice) {
                    fileChunk.append('Slice', file.fileToBeUploaded.slice(start, end));
                } else if (file.fileToBeUploaded.webkitSlice) {
                    fileChunk.append('Slice', file.fileToBeUploaded.webkitSlice(start, end));
                } else if (file.fileToBeUploaded.mozSlice) {
                    fileChunk.append('Slice', file.fileToBeUploaded.mozSlice(start, end));
                } else {
                    displayStatusMessage(file, 'Browser not supporter');
                    return;
                }

                $http.post('/Home/UploadChunk?id=' + file.currentChunk + '&fileIndex=' + file.fileIndex, fileChunk)
                     .error(function(data) {
                         if (data !== 'abort' && retryCount < maxRetries) {
                            ++retryCount;
                            setTimeout(sendNextChunk, file.retryAfterSeconds * 1000);
                        }
                        if (error === 'abort') {
                            displayStatusMessage(file, 'Aborted');
                        } else {
                            if (retryCount === maxRetries) {
                                displayStatusMessage(file, 'Upload timed out.');
                            } else {
                                displayStatusMessage(file, 'Resuming Upload');
                            }
                        }
                        return; 
                     })
                     .success(function(data) {
                         if (data.error || data.isLastBlock) {
                            updateProgress(file);
                            file.displayStatusMessage(file, data.message);
                            if (data.isLastBlock)
                                file.isUploaded = true;
                            return;
                        }
                        ++file.currentChunk;
                        start = (file.currentChunk - 1) * file.blockLength;
                        end = Math.min(file.currentChunk * file.blockLength, file.fileToBeUploaded.size);
                        retryCount = 0;
                        updateProgress(file);
                        if (file.currentChunk <= file.numberOfBlocks) {
                            sendNextChunk();
                        }
                    });
            };
            
            sendNextChunk();
        };

        var updateProgress = function(file) {
            var progress = file.currentChunk / file.numberOfBlocks * 100;
            if (progress <= 100) {
                $rootScope.$broadcast('fileUploadProgress', { item: file, progress: parseInt(progress) });
                displayStatusMessage(file, 'Uploaded ' + progress + '%');
            }
        };
        
        return {
            upload: function(filesToUpload) {
                for (var i = 0; i < filesToUpload.length; i++) {
                    files.push(new ChunkedFile(filesToUpload[i], i));
                }
                for (var j = 0; j < files.length; j++) {
                    uploadMetaData(files[j]);
                }
            }
        };
    }

    uploadSrvFactory.$inject = ['$rootScope', '$http'];

    return uploadSrvFactory;
});

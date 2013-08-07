define(['jquery', 'observable'], function ($, Observable) {

    function chunkFileService($http) {

        function displayStatusMessage(chunkFile, message) {
            chunkFile.trigger('displayStatus', chunkFile.name, message);
        }

        function uploadErrorMessage(chunkFile, message) {
            chunkFile.trigger('uploadError', chunkFile.name, message);
        }

        function updateProgress(chunkFile) {
            var progress = chunkFile.currentChunk / chunkFile.numberOfBlocks * 100;
            if (progress <= 100) {
                chunkFile.trigger('updateProgress', chunkFile.name, parseInt(progress, 10));
            }
        }

        function sendNextChunk(self, params) {
            if (!window.File || !window.Blob || !window.FormData) {
                alert('Browser not supported');
                return;
            }
            params.fileChunk = new FormData();
            var blob;
            if (self.fileToBeUploaded.slice) {
                blob = self.fileToBeUploaded.slice(params.start, params.end);
            } else if (self.fileToBeUploaded.webkitSlice) {
                blob = self.fileToBeUploaded.webkitSlice(params.start, params.end);
            } else if (self.fileToBeUploaded.mozSlice) {
                blob = self.fileToBeUploaded.mozSlice(params.start, params.end);
            } else {
                displayStatusMessage(self, 'Browser not supported');
                return;
            }
            params.fileChunk.append('Slice', blob);

            $.ajax({
                async: true,
                url: 'angular/Upload/UploadChunk?id=' + self.currentChunk + '&fileIndex=' + self.fileIndex,
                data: params.fileChunk,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST'
            }).fail(function(data) {
                if (data !== 'abort' && params.retryCount < self.maxRetries) {
                    ++params.retryCount;
                    setTimeout(sendNextChunk(self, params), self.retryAfterSeconds * 1000);
                }
                if (data === 'abort') {
                    self.isUploading = false;
                    uploadErrorMessage(self, 'Aborted');
                } else {
                    if (params.retryCount === self.maxRetries) {
                        self.isUploading = false;
                        uploadErrorMessage(self, 'Upload timed out.');
                    } else {
                        displayStatusMessage(self, 'Resuming Upload');
                    }
                }
                return;
            }).done(function (data) {
                if (data.error || data.isLastBlock) {
                    updateProgress(self);
                    if (data.error) {
                        self.isUploading = false;
                        uploadErrorMessage(self, data.message);
                    } else
                        displayStatusMessage(self, data.message);
                    if (data.isLastBlock) {
                        self.isUploaded = true;
                        self.isUploading = false;
                    }
                    return;
                }
                ++self.currentChunk;
                params.start = (self.currentChunk - 1) * self.blockLength;
                params.end = Math.min(self.currentChunk * self.blockLength, self.fileToBeUploaded.size);
                params.retryCount = 0;
                updateProgress(self);
                if (self.currentChunk <= self.numberOfBlocks) {
                    sendNextChunk(self, params);
                }
            });
        }

        function ChunkedFile(file, index) {
            $.extend(this, new Observable());
                
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
            this.file = file;
            this.isUploading = false;
        }

        ChunkedFile.prototype.uploadMetaData = function () {
            var self = this;
            this.isUploading = true;
            this.numberOfBlocks = Math.ceil(this.size / this.blockLength);
            this.currentChunk = 1;
            $http({  // TODO : faire l'appel dans un HTML5 Worker
                method: 'POST',
                url: 'angular/Upload/SetMetadata?blocksCount=' + self.numberOfBlocks
                    + '&fileName=' + self.name
                    + '&fileSize=' + self.size
                    + '&fileIndex=' + self.fileIndex
            }).success(function(data) {
                if (data.success == true) {
                    displayStatusMessage(self, 'Uploading');
                    self.sendFile();
                } else {
                    self.isUploading = false;
                }
            }).error(function() {
                uploadErrorMessage(self, "Failed to send MetaData");
                self.isUploading = false;
            });
        };

        ChunkedFile.prototype.sendFile = function() {
            var self = this;
            var fileChunkParams = {
                start: 0,
                end: Math.min(self.blockLength, self.fileToBeUploaded.size),
                retryCount: 0,
                fileChunk: null
            };

            sendNextChunk(self, fileChunkParams);
        };

        return {
                getNewChunkedFile: function(file, index) {
                    return new ChunkedFile(file, index);
                }   
        };
    }
    
    chunkFileService.$inject = ['$http'];

    return chunkFileService;
});

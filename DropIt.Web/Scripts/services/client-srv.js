define(['signalr'], function ($) {
    
    function clientSrvFactory($rootScope) {

        var connection,
            hubProxy,
            connectionStarted = false,
            clientId;
        

        var initCnx = function (id) {
            clientId = id;
            connection = $.hubConnection(url.ApplicationName + '/signalr', { useDefaultPath: false });
            hubProxy = connection.createHubProxy('UploadProgressHub');
        };
        
        return {
            initServerConnection: function (id) {
                initCnx(id);
                connection.start().done(function() {
                    connectionStarted = true;
                    //console.log('connected !');
                }).fail(function(error) { 
                    console.log('connection failed :( - ' + error);
                });
            },
            initClientConnection: function (id) {
                initCnx(id);
                hubProxy.on('updateProgress', function (filename, progress) {
                    //console.log(filename + " is " + progress + " % complete");
                    $rootScope.$broadcast('fileUploadProgress', { item: filename, progress: progress });
                    if (!$rootScope.$$phase) {
                        $rootScope.$apply();
                    }
                });
                hubProxy.on('removeFile', function(filename) {
                    //console.log('File ' + filename + ' needs to be removed.');
                    $rootScope.$broadcast('fileRemove', { item: filename });
                    if (!$rootScope.$$phase) {
                        $rootScope.$apply();
                    }
                });
                connection.start().done(function () {
                    connectionStarted = true;
                    hubProxy.invoke('joinGroup', clientId)
                        .done(function() {
                             // console.log('joined group: ' + clientId + ', connectionId: ' + connection.id);
                        })
                        .fail(function(error) {
                             console.log('Failed joing group : ' + error);
                        });
                });
            },
            sendProgressUpdate: function (filename, progress) {
                if (connectionStarted) {
                    hubProxy.invoke('updateProgress', { Id: clientId, Filename: filename, Progress: progress })
                        .done(function () {
                            //console.log('update sent to : ' + clientId + ', ' + filename + ', ' + progress + ' %');
                        })
                        .fail(function(error) {
                            console.log('Failed to send progress update : ' + error);
                        });
                }
            },
            sendRemoveFile: function(filename) {
                if (connectionStarted) {
                    hubProxy.invoke('removeFile', { Id: clientId, Filename: filename })
                        .done(function() {
                           // console.log('File ' + filename + ' was removed and the info was sent.');
                        })
                        .fail(function(error) {
                            console.log('Failed to send remove file update : ' + error);
                        });
                }
            }
        };
    }

    clientSrvFactory.$inject = ['$rootScope'];

    return clientSrvFactory;
});

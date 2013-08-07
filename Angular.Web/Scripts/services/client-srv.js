define(['signalr'], function ($) {
    
    function clientSrvFactory() {

        var connection,
            hubProxy,
            connectionStarted = false,
            clientId;
        

        var initCnx = function() {
            connection = $.hubConnection('/angular/signalr', { useDefaultPath : false});
            hubProxy = connection.createHubProxy('uploadProgressHub');
        };
        
        return {
            initServerConnection: function (id) {
                clientId = id;
                initCnx();
                connection.start().done(function() {
                    connectionStarted = true;
                    console.log('connected !');
                }).fail(function(error) { 
                    console.log('connection failed :( - ' + error);
                });
            },
            initClientConnection: function(id) {
                initCnx();
                hubProxy.on('updateProgress', function(filename, progress) {
                    console.log(filename + " is " + progress + " % complete");
                });
                connection.start().done(function () {
                    connectionStarted = true;
                    hubProxy.invoke('joinGroup', id)
                        .done(function () { console.log('joined group ' + id); })
                        .fail(function (error) { console.log('Failed joing group : ' + error); });
                });
            },
            sendProgressUpdate: function (filename, progress) {
                if (connectionStarted) {
                    hubProxy.invoke('updateProgress', { id: clientId, filename: filename, progress: progress })
                        .done(function () {
                            console.log('update sent to : ' + clientId + ', ' + filename + ', ' + progress + ' %');
                        })
                        .fail(function(error) {
                            console.log('Failed to send progress update : ' + error);
                        });
                }
            }
        };
    }

    return clientSrvFactory;
});

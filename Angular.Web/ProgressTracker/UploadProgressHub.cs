using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;

namespace Angular.Web.ProgressTracker
{
    [HubName("UploadProgressHub")]
    public class UploadProgressHub :  Hub
    {
        public async Task UpdateProgress(ProgressUpdateMessage message)
        {
            await Clients.Group(message.Id).updateProgress(message.Filename, message.Progress);
        }

        public async Task RemoveFile(FileMessage message)
        {
            await Clients.Group(message.Id).removeFile(message.Filename);
        }

        public async Task JoinGroup(string id)
        {
            await Groups.Add(Context.ConnectionId, id);
        }
    }

    public class ProgressUpdateMessage : FileMessage
    {
        public double Progress { get; set; }
    }

    public class FileMessage
    {
        public string Id { get; set; }
        public string Filename { get; set; }
    }
}
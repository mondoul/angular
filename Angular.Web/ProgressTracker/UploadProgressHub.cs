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

        public async Task JoinGroup(string id)
        {
            await Groups.Add(Context.ConnectionId, id);
        }
    }

    public class ProgressUpdateMessage
    {
        public string Id { get; set; }
        public string Filename { get; set; }
        public double Progress { get; set; }
    }
}
using Microsoft.AspNet.SignalR;

namespace Angular.Web.ProgressTracker
{
    public class UploadProgressHub :  Hub
    {
        public void UpdateProgress(string id, string filename, double progress)
        {
            Clients.Client(id).updateProgress(filename, progress);
        }

        public void JoinGroup(string id)
        {
            
        }
    }
}
using System;
using Microsoft.WindowsAzure.Storage.Blob;

namespace DropIt.Web.Models
{
    public class CloudFile
    {
        public string FileName { get; set; }
        public string URL { get; set; }
        public long Size { get; set; }
        public long BlockCount { get; set; }
        public CloudBlockBlob BlockBlob { get; set; }
        public DateTime StartTime { get; set; }
        public string UploadStatusMessage { get; set; }
        public bool IsUploadCompleted { get; set; }
        public string FileKey { get; set; }
        public int FileIndex { get; set; }

        public static CloudFile CreateFromIListBlobItem(IListBlobItem item)
        {
            var blockBlob = item as CloudBlockBlob;
            if (blockBlob != null)
            {
                var blob = blockBlob;
                return new CloudFile
                {
                    FileName = blob.Name,
                    URL = blob.Uri.ToString(),
                    Size = blob.Properties.Length
                };
            }
            return null;
        }
    }
}
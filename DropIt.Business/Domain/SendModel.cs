using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using DropIt.Business.Domain.FormatProvider;
using Newtonsoft.Json;

namespace DropIt.Business.Domain
{
    public class SendModel
    {
        [Key]
        public string Guid { get; set; }
        public List<FileModel> Files { get; set; }
        public string ShortenedUrl { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string Message { get; set; }
        public bool NotifyWhenDownloadComplete { get; set; }
        public DateTime Created { get; set; }

        public SendModel()
        {
            Files = new List<FileModel>();
        }
    }

    public class FileModel
    {
        public int Id { get; set; }
        public string SendModelId { get; set; }
        public string Name { get; set; }
        public long Size { get; set; }
        public bool IsUploaded { get; set; }
        public bool IsDownloaded { get; set; }

        public string FormattedSize
        {
            get { return Size.ToFileSize(); }
        }
        [JsonIgnore]
        public virtual SendModel Parent { get; set; }
    }

}
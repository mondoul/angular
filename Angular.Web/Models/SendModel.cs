using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Angular.Web.Models.FormatProvider;

namespace Angular.Web.Models
{
    public class SendModel
    {
        [Key]
        public string Guid { get; set; }
        public List<FileModel> Files { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string Message { get; set; }

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

        public string FormattedSize
        {
            get { return Size.ToFileSize(); }
        }

        public virtual SendModel Parent { get; set; }
    }
}
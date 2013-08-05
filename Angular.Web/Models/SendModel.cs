using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

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
        public double Size { get; set; }

        public virtual SendModel Parent { get; set; }
    }
}
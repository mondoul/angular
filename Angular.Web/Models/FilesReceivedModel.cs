using System.Collections.Generic;
using DropIt.Business.Domain;

namespace DropIt.Web.Models
{
    public class FilesReceivedModel
    {
        public string Name { get; set; }
        public List<FileModel> Files { get; set; }
    }
}
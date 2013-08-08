using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Angular.Web.Models
{
    public class FilesReceivedModel
    {
        public string Name { get; set; }
        public List<FileModel> Files { get; set; }
    }
}
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Angular.Web.Models
{
    public class SendModel
    {
        [Key]
        public Guid Guid { get; set; }
        public List<string> Files { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public string Message { get; set; }
    }
}
using System.Data.Entity;
using Angular.Web.Models;

namespace Angular.Web.Data
{
    public class DropItDbContext : DbContext
    {
        public IDbSet<FileModel> FileModels { get; set; }
        public IDbSet<SendModel> SendModels { get; set; }
    }
}
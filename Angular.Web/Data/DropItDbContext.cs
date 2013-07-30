using System.Data.Entity;
using Angular.Web.Models;

namespace Angular.Web.Data
{
    public class DropItDbContext : DbContext
    {
        public IDbSet<SendModel> SendModels { get; set; }

    }
}
using System.Data.Entity;
using DropIt.Business.Domain;

namespace DropIt.Business.Data
{
    public class DropItDbContext : DbContext
    {
        public DbSet<FileModel> FileModels { get; set; }
        public DbSet<SendModel> SendModels { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<SendModel>()
                .HasMany(s => s.Files)
                .WithRequired(f => f.Parent)
                .HasForeignKey(f => f.SendModelId)
                .WillCascadeOnDelete();

            modelBuilder.Entity<FileModel>()
                .Ignore(p => p.FormattedSize);
        }
    }
}
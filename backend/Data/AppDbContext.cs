using Microsoft.EntityFrameworkCore;
using backend.Entities;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Person> Persons => Set<Person>();
    public DbSet<MapDrawing> MapDrawings => Set<MapDrawing>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure 1-to-1 relationship with Cascade delete
        modelBuilder.Entity<Person>()
            .HasOne(p => p.MapDrawing)
            .WithOne(d => d.Person)
            .HasForeignKey<MapDrawing>(d => d.PersonId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

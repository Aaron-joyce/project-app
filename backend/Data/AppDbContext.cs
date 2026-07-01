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

        // Configure 1-to-many relationship with Cascade delete
        modelBuilder.Entity<Person>()
            .HasMany(p => p.MapDrawings)
            .WithOne(d => d.Person)
            .HasForeignKey(d => d.PersonId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

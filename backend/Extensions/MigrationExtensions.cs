using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Extensions;

public static class MigrationExtensions
{
    public static void ApplyMigrations(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var services = scope.ServiceProvider;

        try
        {
            var context = services.GetRequiredService<AppDbContext>();
            if (context.Database.ProviderName == "Microsoft.EntityFrameworkCore.SqlServer")
            {
                context.Database.EnsureCreated();
                try
                {
                    context.Database.ExecuteSqlRaw(
                        "IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MapDrawings_PersonId' AND object_id = OBJECT_ID('MapDrawings')) " +
                        "DROP INDEX IX_MapDrawings_PersonId ON MapDrawings;");
                    
                    context.Database.ExecuteSqlRaw(
                        "IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MapDrawings_PersonId' AND object_id = OBJECT_ID('MapDrawings')) " +
                        "CREATE INDEX IX_MapDrawings_PersonId ON MapDrawings(PersonId);");

                    context.Database.ExecuteSqlRaw(
                        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('MapDrawings') AND name = 'Name') " +
                        "ALTER TABLE MapDrawings ADD Name nvarchar(100) NOT NULL DEFAULT 'Default Map';");
                }
                catch (Exception ex)
                {
                    var loggerFactory = services.GetRequiredService<ILoggerFactory>();
                    var logger = loggerFactory.CreateLogger("MigrationExtensions");
                    logger.LogWarning(ex, "Failed to drop unique index on SQL Server. It may have already been dropped.");
                }
            }
            else
            {
                context.Database.Migrate();
            }
        }
        catch (Exception ex)
        {
            var loggerFactory = services.GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger("MigrationExtensions");
            logger.LogError(ex, "An error occurred while migrating the database.");
        }
    }
}

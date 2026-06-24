using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Middleware;
using backend.Services;
using backend.Extensions;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("Logs/backend-log-.txt", 
        rollingInterval: RollingInterval.Day,
        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz}] [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("Starting web application host");
    
    var builder = WebApplication.CreateBuilder(args);

    // Integrate Serilog as logging provider
    builder.Host.UseSerilog();

    // Add services to the container.
    builder.Services.AddOpenApi();

    // Register the Database Context
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

    // Configure CORS to allow the frontend to access the API
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });

    // Add support for Controllers
    builder.Services.AddControllers();

    // Register Service Layer
    builder.Services.AddScoped<IPersonService, PersonService>();

    // Add Global Exception Handler
    builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
    builder.Services.AddProblemDetails();

    var app = builder.Build();

    // Enable Global Exception Handler middleware
    app.UseExceptionHandler();

    // Automatically apply database migrations on startup
    app.ApplyMigrations();

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
    }

    app.UseHttpsRedirection();

    // Enable CORS
    app.UseCors("AllowFrontend");

    app.UseAuthorization();

    // Map Controller routes
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}


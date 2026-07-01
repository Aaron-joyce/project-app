using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
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
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        if (connectionString != null && (connectionString.Contains("Server=") || connectionString.Contains("server=")))
        {
            options.UseSqlServer(connectionString, sqlOptions => 
                sqlOptions.EnableRetryOnFailure());
        }
        else
        {
            options.UseSqlite(connectionString);
        }
    });

    // Configure JWT Authentication
    var jwtKey = builder.Configuration["Jwt:Key"] ?? "superSecretKeyOfAtLeast32BytesLengthNeededForSigningJWTs!!";
    var key = Encoding.UTF8.GetBytes(jwtKey);

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // Disable in dev
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "ProjectAppAPI",
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "ProjectAppClient",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

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

    app.UseDefaultFiles();
    app.UseStaticFiles();

    // Enable CORS
    app.UseCors("AllowFrontend");

    // Enable Authentication BEFORE Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    // Map Controller routes
    app.MapControllers();
    app.MapFallbackToFile("index.html");

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

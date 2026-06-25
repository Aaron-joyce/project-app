using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using backend.Exceptions;

namespace backend.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Internal Server Error",
            Detail = "An unexpected error occurred. Please try again later.",
            Instance = httpContext.Request.Path
        };

        switch (exception)
        {
            case DuplicateEmailException duplicateEmailEx:
                problemDetails.Status = StatusCodes.Status409Conflict;
                problemDetails.Title = "Email Conflict";
                problemDetails.Detail = duplicateEmailEx.Message;
                break;

            case EntityNotFoundException notFoundEx:
                problemDetails.Status = StatusCodes.Status404NotFound;
                problemDetails.Title = "Resource Not Found";
                problemDetails.Detail = notFoundEx.Message;
                break;

            case ArgumentException argumentEx:
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Title = "Bad Request";
                problemDetails.Detail = argumentEx.Message;
                break;

            case UnauthorizedAccessException unauthorizedEx:
                problemDetails.Status = StatusCodes.Status403Forbidden;
                problemDetails.Title = "Forbidden Access";
                problemDetails.Detail = unauthorizedEx.Message;
                break;

            case Microsoft.EntityFrameworkCore.DbUpdateException dbUpdateEx:
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Title = "Database Update Failed";
                problemDetails.Detail = "A database constraint violation occurred. Please check your inputs.";
                break;
        }

        httpContext.Response.StatusCode = problemDetails.Status.Value;
        httpContext.Response.ContentType = "application/json";

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        // Return true to signal that this exception is handled
        return true;
    }
}

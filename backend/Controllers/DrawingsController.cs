using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using backend.Dtos;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DrawingsController : ControllerBase
{
    private readonly IPersonService _personService;
    private readonly ILogger<DrawingsController> _logger;

    public DrawingsController(IPersonService personService, ILogger<DrawingsController> logger)
    {
        _personService = personService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> AddDrawing([FromBody] MapDrawingDto dto)
    {
        var currentUserId = GetCurrentUserId();
        _logger.LogInformation("Controller: Adding new drawing for user: {UserId}", currentUserId);
        var drawingId = await _personService.AddDrawingAsync(currentUserId, dto);
        return Ok(new { message = "Drawing added successfully!", id = drawingId });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDrawing(Guid id, [FromBody] MapDrawingDto dto)
    {
        var currentUserId = GetCurrentUserId();
        _logger.LogInformation("Controller: Updating drawing ID: {DrawingId} for user: {UserId}", id, currentUserId);
        await _personService.UpdateDrawingAsync(currentUserId, id, dto);
        return Ok(new { message = "Drawing updated successfully!", id });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDrawing(Guid id)
    {
        var currentUserId = GetCurrentUserId();
        _logger.LogInformation("Controller: Deleting drawing ID: {DrawingId} for user: {UserId}", id, currentUserId);
        await _personService.DeleteDrawingAsync(currentUserId, id);
        return Ok(new { message = "Drawing deleted successfully!", id });
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var currentUserId))
        {
            throw new UnauthorizedAccessException("Invalid or missing user identity in token.");
        }
        return currentUserId;
    }
}

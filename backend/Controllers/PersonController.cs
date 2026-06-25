using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using backend.Dtos;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonController : ControllerBase
{
    private readonly IPersonService _personService;
    private readonly ILogger<PersonController> _logger;

    public PersonController(IPersonService personService, ILogger<PersonController> logger)
    {
        _personService = personService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetPersons()
    {
        var currentUserId = GetCurrentUserId();
        _logger.LogInformation("Controller: Retrieving persons for user ID: {UserId}.", currentUserId);
        var persons = await _personService.GetAllPersonsAsync(currentUserId);
        return Ok(persons);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetPersonById(Guid id)
    {
        var currentUserId = GetCurrentUserId();
        _logger.LogInformation("Controller: Retrieving details for person ID: {PersonId} by {UserId}", id, currentUserId);
        var person = await _personService.GetPersonByIdAsync(id, currentUserId);
        return Ok(person);
    }

    [HttpPost]
    public async Task<IActionResult> RegisterPerson([FromBody] PersonDto dto)
    {
        _logger.LogInformation("Controller: Registering new person: {FullName}", dto.FullName);
        var personId = await _personService.RegisterPersonAsync(dto);
        return Ok(new { message = "Registration saved successfully!", personId });
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdatePerson(Guid id, [FromBody] PersonDto dto)
    {
        var currentUserId = GetCurrentUserId();
        _logger.LogInformation("Controller: Updating person ID: {PersonId} ({FullName}) by {UserId}", id, dto.FullName, currentUserId);
        await _personService.UpdatePersonAsync(id, dto, currentUserId);
        return Ok(new { message = "Person updated successfully!", personId = id });
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

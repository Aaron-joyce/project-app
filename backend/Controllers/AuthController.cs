using Microsoft.AspNetCore.Mvc;
using backend.Dtos;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IPersonService _personService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IPersonService personService, ILogger<AuthController> logger)
    {
        _personService = personService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        _logger.LogInformation("Controller: Login attempt for email: {Email}", loginDto.EmailAddress);
        
        var response = await _personService.AuthenticateAsync(loginDto);
        return Ok(response);
    }
}

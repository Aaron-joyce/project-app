using Microsoft.AspNetCore.Mvc;
using backend.Dtos;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonController : ControllerBase
{
    private readonly IPersonService _personService;
    private readonly ILogger<PersonController> _logger;

    // Constructor-inject IPersonService and ILogger
    public PersonController(IPersonService personService, ILogger<PersonController> logger)
    {
        _personService = personService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetPersons()
    {
        _logger.LogInformation("Controller: Retrieving all persons.");
        var persons = await _personService.GetAllPersonsAsync();
        return Ok(persons);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPersonById(Guid id)
    {
        _logger.LogInformation("Controller: Retrieving details for person ID: {PersonId}", id);
        var person = await _personService.GetPersonByIdAsync(id);
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
    public async Task<IActionResult> UpdatePerson(Guid id, [FromBody] PersonDto dto)
    {
        _logger.LogInformation("Controller: Updating person ID: {PersonId} ({FullName})", id, dto.FullName);
        await _personService.UpdatePersonAsync(id, dto);
        return Ok(new { message = "Person updated successfully!", personId = id });
    }
}

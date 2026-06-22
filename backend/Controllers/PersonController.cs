using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging; // Added for explicit logging
using backend.Data;
using backend.Dtos;
using backend.Entities;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<PersonController> _logger;

    // Constructor-inject both DbContext and ILogger
    public PersonController(AppDbContext context, ILogger<PersonController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetPersons()
    {
        _logger.LogInformation("Retrieving all persons from the database.");
        try
        {
            var persons = await _context.Persons.ToListAsync();
            _logger.LogInformation("Successfully retrieved {Count} person records from the database.", persons.Count);
            return Ok(persons);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving person list from database.");
            return StatusCode(500, new { message = "An error occurred while retrieving data.", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPersonById(int id)
    {
        _logger.LogInformation("Retrieving details for person ID: {PersonId}", id);
        try
        {
            var person = await _context.Persons.FindAsync(id);
            if (person == null)
            {
                _logger.LogWarning("Query complete: Person with ID: {PersonId} not found in database.", id);
                return NotFound(new { message = $"Person with ID {id} not found." });
            }
            _logger.LogInformation("Successfully retrieved details for person ID: {PersonId} ({FullName})", id, person.FullName);
            return Ok(person);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving details for person ID: {PersonId}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the person.", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> RegisterPerson([FromBody] PersonDto dto)
    {
        _logger.LogInformation("Starting database write to register new person: {FullName}", dto.FullName);
        try
        {
            var person = new Person
            {
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                EmailAddress = dto.EmailAddress,
                ShapeType = dto.ShapeType,
                GeometryDataJson = dto.GeometryDataJson
            };

            _context.Persons.Add(person);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully saved person to database. Assigned ID: {PersonId}, Shape: {ShapeType}", person.Id, person.ShapeType);
            return Ok(new { message = "Registration saved successfully!", personId = person.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while writing new person record ({FullName}) to database.", dto.FullName);
            return StatusCode(500, new { message = "An error occurred while saving the registration.", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePerson(int id, [FromBody] PersonDto dto)
    {
        _logger.LogInformation("Starting database write to update person ID: {PersonId} ({FullName})", id, dto.FullName);
        try
        {
            var person = await _context.Persons.FindAsync(id);
            if (person == null)
            {
                _logger.LogWarning("Update failed: Person with ID: {PersonId} not found in database.", id);
                return NotFound(new { message = $"Person with ID {id} not found." });
            }

            person.FullName = dto.FullName;
            person.PhoneNumber = dto.PhoneNumber;
            person.EmailAddress = dto.EmailAddress;
            person.ShapeType = dto.ShapeType;
            person.GeometryDataJson = dto.GeometryDataJson;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully committed updates to database for person ID: {PersonId}.", id);
            return Ok(new { message = "Person updated successfully!", personId = person.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while committing updates to database for person ID: {PersonId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the record.", error = ex.Message });
        }
    }
}

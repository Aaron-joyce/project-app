using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Added for database queries
using backend.Data;
using backend.Dtos;
using backend.Entities;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonController : ControllerBase
{
    private readonly AppDbContext _context;

    public PersonController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPersons()
    {
        try
        {
            var persons = await _context.Persons.ToListAsync();
            return Ok(persons);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving data.", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPersonById(int id)
    {
        try
        {
            var person = await _context.Persons.FindAsync(id);
            if (person == null)
            {
                return NotFound(new { message = $"Person with ID {id} not found." });
            }
            return Ok(person);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the person.", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> RegisterPerson([FromBody] PersonDto dto)
    {
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

            return Ok(new { message = "Registration saved successfully!", personId = person.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while saving the registration.", error = ex.Message });
        }
    }
}

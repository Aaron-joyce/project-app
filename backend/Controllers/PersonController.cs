using Microsoft.AspNetCore.Mvc;
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

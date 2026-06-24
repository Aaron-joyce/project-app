using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using backend.Data;
using backend.Dtos;
using backend.Entities;
using backend.Exceptions;

namespace backend.Services;

public class PersonService : IPersonService
{
    private readonly AppDbContext _context;
    private readonly ILogger<PersonService> _logger;

    public PersonService(AppDbContext context, ILogger<PersonService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<PersonResponseDto>> GetAllPersonsAsync()
    {
        _logger.LogInformation("Service Layer: Retrieving all persons from context.");
        return await _context.Persons
            .Include(p => p.MapDrawing)
            .Select(p => new PersonResponseDto
            {
                Id = p.Id,
                FullName = p.FullName,
                PhoneNumber = p.PhoneNumber,
                EmailAddress = p.EmailAddress,
                ShapeType = p.MapDrawing != null ? p.MapDrawing.ShapeType : string.Empty,
                GeometryDataJson = p.MapDrawing != null ? p.MapDrawing.GeometryDataJson : string.Empty,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<PersonResponseDto> GetPersonByIdAsync(Guid id)
    {
        _logger.LogInformation("Service Layer: Retrieving details for person ID: {PersonId}", id);
        var person = await _context.Persons
            .Include(p => p.MapDrawing)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (person == null)
        {
            _logger.LogWarning("Service Layer: Person with ID: {PersonId} not found in database.", id);
            throw new EntityNotFoundException($"Person with ID {id} not found.");
        }

        return new PersonResponseDto
        {
            Id = person.Id,
            FullName = person.FullName,
            PhoneNumber = person.PhoneNumber,
            EmailAddress = person.EmailAddress,
            ShapeType = person.MapDrawing != null ? person.MapDrawing.ShapeType : string.Empty,
            GeometryDataJson = person.MapDrawing != null ? person.MapDrawing.GeometryDataJson : string.Empty,
            CreatedAt = person.CreatedAt
        };
    }

    public async Task<Guid> RegisterPersonAsync(PersonDto dto)
    {
        _logger.LogInformation("Service Layer: Registering new person: {FullName}", dto.FullName);

        var emailExists = await _context.Persons.AnyAsync(p => p.EmailAddress == dto.EmailAddress);
        if (emailExists)
        {
            _logger.LogWarning("Service Layer: Email address {Email} is already registered.", dto.EmailAddress);
            throw new DuplicateEmailException($"Email address '{dto.EmailAddress}' is already registered.");
        }

        var personId = Guid.NewGuid();
        var person = new Person
        {
            Id = personId,
            FullName = dto.FullName,
            PhoneNumber = dto.PhoneNumber,
            EmailAddress = dto.EmailAddress,
            MapDrawing = new MapDrawing
            {
                PersonId = personId,
                ShapeType = dto.ShapeType,
                GeometryDataJson = dto.GeometryDataJson
            }
        };

        _context.Persons.Add(person);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Service Layer: Saved person to database. Assigned ID: {PersonId}", person.Id);
        return person.Id;
    }

    public async Task UpdatePersonAsync(Guid id, PersonDto dto)
    {
        _logger.LogInformation("Service Layer: Updating person ID: {PersonId}", id);

        var person = await _context.Persons
            .Include(p => p.MapDrawing)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (person == null)
        {
            _logger.LogWarning("Service Layer: Person with ID: {PersonId} not found in database.", id);
            throw new EntityNotFoundException($"Person with ID {id} not found.");
        }

        var emailExists = await _context.Persons.AnyAsync(p => p.EmailAddress == dto.EmailAddress && p.Id != id);
        if (emailExists)
        {
            _logger.LogWarning("Service Layer: Email address {Email} is already registered to another person.", dto.EmailAddress);
            throw new DuplicateEmailException($"Email address '{dto.EmailAddress}' is already registered to another person.");
        }

        person.FullName = dto.FullName;
        person.PhoneNumber = dto.PhoneNumber;
        person.EmailAddress = dto.EmailAddress;

        if (person.MapDrawing == null)
        {
            person.MapDrawing = new MapDrawing
            {
                PersonId = id,
                ShapeType = dto.ShapeType,
                GeometryDataJson = dto.GeometryDataJson
            };
        }
        else
        {
            person.MapDrawing.ShapeType = dto.ShapeType;
            person.MapDrawing.GeometryDataJson = dto.GeometryDataJson;
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Service Layer: Committed updates to database for person ID: {PersonId}.", id);
    }
}

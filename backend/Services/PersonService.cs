using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using backend.Data;
using backend.Dtos;
using backend.Entities;
using backend.Exceptions;

namespace backend.Services;

public class PersonService : IPersonService
{
    private readonly AppDbContext _context;
    private readonly ILogger<PersonService> _logger;
    private readonly IConfiguration _configuration;
    private readonly PasswordHasher<Person> _passwordHasher;

    public PersonService(AppDbContext context, ILogger<PersonService> logger, IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;
        _passwordHasher = new PasswordHasher<Person>();
    }

    public async Task<IEnumerable<PersonResponseDto>> GetAllPersonsAsync(Guid currentUserId)
    {
        _logger.LogInformation("Service Layer: Retrieving only user details for ID: {UserId}.", currentUserId);
        return await _context.Persons
            .Include(p => p.MapDrawing)
            .Where(p => p.Id == currentUserId) // Restrict view to only current logged-in user
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

    public async Task<PersonResponseDto> GetPersonByIdAsync(Guid id, Guid currentUserId)
    {
        _logger.LogInformation("Service Layer: Retrieving details for person ID: {PersonId}", id);

        if (id != currentUserId)
        {
            _logger.LogWarning("Service Layer: Unauthorized access attempt by {UserId} to read {PersonId}", currentUserId, id);
            throw new UnauthorizedAccessException("You are not authorized to view this person's record.");
        }

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

        if (string.IsNullOrWhiteSpace(dto.Password))
        {
            throw new ArgumentException("Password is required for registration.");
        }

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

        // Hash the password before saving
        person.PasswordHash = _passwordHasher.HashPassword(person, dto.Password);

        _context.Persons.Add(person);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Service Layer: Saved person to database. Assigned ID: {PersonId}", person.Id);
        return person.Id;
    }

    public async Task UpdatePersonAsync(Guid id, PersonDto dto, Guid currentUserId)
    {
        _logger.LogInformation("Service Layer: Updating person ID: {PersonId}", id);

        if (id != currentUserId)
        {
            _logger.LogWarning("Service Layer: Unauthorized edit attempt by {UserId} to modify {PersonId}", currentUserId, id);
            throw new UnauthorizedAccessException("You are not authorized to modify this person's record.");
        }

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

        // Update password if a new one is provided
        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            person.PasswordHash = _passwordHasher.HashPassword(person, dto.Password);
        }

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

    public async Task<LoginResponseDto> AuthenticateAsync(LoginDto loginDto)
    {
        _logger.LogInformation("Service Layer: Authenticating user email: {Email}", loginDto.EmailAddress);

        var person = await _context.Persons
            .FirstOrDefaultAsync(p => p.EmailAddress == loginDto.EmailAddress);

        if (person == null)
        {
            _logger.LogWarning("Service Layer: Authentication failed. Email not found: {Email}", loginDto.EmailAddress);
            throw new ArgumentException("Invalid Email Address or Password.");
        }

        var result = _passwordHasher.VerifyHashedPassword(person, person.PasswordHash, loginDto.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            _logger.LogWarning("Service Layer: Authentication failed. Invalid password for: {Email}", loginDto.EmailAddress);
            throw new ArgumentException("Invalid Email Address or Password.");
        }

        // Generate JWT Token
        var tokenHandler = new JwtSecurityTokenHandler();
        var jwtKey = _configuration["Jwt:Key"] ?? "superSecretKeyOfAtLeast32BytesLengthNeededForSigningJWTs!!";
        var key = Encoding.UTF8.GetBytes(jwtKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, person.Id.ToString()),
                new Claim(ClaimTypes.Email, person.EmailAddress),
                new Claim(ClaimTypes.Name, person.FullName)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _configuration["Jwt:Issuer"] ?? "ProjectAppAPI",
            Audience = _configuration["Jwt:Audience"] ?? "ProjectAppClient",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return new LoginResponseDto
        {
            Token = tokenHandler.WriteToken(token),
            PersonId = person.Id,
            EmailAddress = person.EmailAddress,
            FullName = person.FullName
        };
    }
}

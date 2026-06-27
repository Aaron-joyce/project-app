using Moq;
using Microsoft.Extensions.Logging;
using backend.Services;
using backend.Controllers;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Net.WebSockets;
using backend.Dtos;
using Microsoft.AspNetCore.Authentication.OAuth;

namespace backend.Tests;

public class PersonControllerTest
{

    private readonly Mock<IPersonService> mockServicce;
    private readonly Mock<ILogger<PersonController>> mockLogger;
    private readonly PersonController personController;
    private readonly Guid testId;

    public PersonControllerTest()
    {
        mockServicce = new Mock<IPersonService>();
        mockLogger = new Mock<ILogger<PersonController>>();
        testId = Guid.NewGuid();

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, testId.ToString())
        };

        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        var controllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext {User = claimsPrincipal}
        };

        personController = new PersonController(mockServicce.Object, mockLogger.Object)
        {
            ControllerContext = controllerContext
        };
    }


    [Fact]
    public async Task GetPerson_WhenAuthenticated_ReturnsOk()
    {
        Console.WriteLine("Testing Get All Person (RETUREN OK)");
        var mockPersonList = new List<PersonResponseDto>
        {
            new PersonResponseDto {FullName = "Alice Smith", EmailAddress="alice@gmail.com"},
            new PersonResponseDto {FullName="Bob Jones", EmailAddress="bob@gmail.com"}
        };

        mockServicce.Setup(service => service.GetAllPersonsAsync(testId)).ReturnsAsync(mockPersonList);
        
        var result = await personController.GetPersons();
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedPersonList = Assert.IsAssignableFrom<IEnumerable<PersonResponseDto>>(okResult.Value);

        Assert.NotNull(returnedPersonList);
        Assert.Contains(returnedPersonList, p=>p.FullName=="Alice Smith");

        mockServicce.Verify(s=>s.GetAllPersonsAsync(testId), Times.Once);
        Console.WriteLine($"Test Passed. Returned:{returnedPersonList}");
    }

    [Fact]
    public async Task GetPersonById_WhenAuthenticated_ReturnsOkWithPerson()
    {
        Console.WriteLine("Testing Get All Person By ID (RETUREN OK)");
        var personId = Guid.NewGuid();
        var mockPerson = new PersonResponseDto 
        { 
            Id = personId, 
            FullName = "Alice Smith", 
            EmailAddress = "alice@gmail.com" 
        };

        mockServicce.Setup(service => service.GetPersonByIdAsync(personId, testId))
            .ReturnsAsync(mockPerson);

        var result = await personController.GetPersonById(personId);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedPerson = Assert.IsType<PersonResponseDto>(okResult.Value);
        Assert.Equal(personId, returnedPerson.Id);
        Assert.Equal("Alice Smith", returnedPerson.FullName);

        mockServicce.Verify(s => s.GetPersonByIdAsync(personId, testId), Times.Once);
        Console.WriteLine($"Test Passed. Person:{returnedPerson}");
    }

    [Fact]
    public async Task RegisterPerson_ReturnsOkWithPersonId()
    {
        Console.WriteLine("Testing Register New Person (RETUREN OK)");
        var personDto = new PersonDto
        {
            FullName = "New Person",
            EmailAddress = "new@gmail.com",
            Password = "password123",
            ShapeType = "Circle",
            GeometryDataJson = "{}"
        };
        var expectedPersonId = Guid.NewGuid();

        mockServicce.Setup(service => service.RegisterPersonAsync(personDto))
            .ReturnsAsync(expectedPersonId);

        var result = await personController.RegisterPerson(personDto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var data = okResult.Value;
        Assert.NotNull(data);
        
        var messageProperty = data.GetType().GetProperty("message")?.GetValue(data, null) as string;
        var idProperty = data.GetType().GetProperty("personId")?.GetValue(data, null);

        Assert.Equal("Registration saved successfully!", messageProperty);
        Assert.Equal(expectedPersonId, idProperty);

        mockServicce.Verify(s => s.RegisterPersonAsync(personDto), Times.Once);
        Console.WriteLine($"Test Passed. Message:{messageProperty}");
    }

    [Fact]
    public async Task UpdatePerson_WhenAuthenticated_ReturnsOk()
    {
        Console.WriteLine("Testing Update Person (RETUREN OK)");
        var personId = testId;
        var personDto = new PersonDto
        {
            FullName = "Updated Name",
            EmailAddress = "updated@gmail.com",
            Password = "newpassword123",
            ShapeType = "Polygon",
            GeometryDataJson = "{}"
        };

        mockServicce.Setup(service => service.UpdatePersonAsync(personId, personDto, testId))
            .Returns(Task.CompletedTask);

        var result = await personController.UpdatePerson(personId, personDto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var data = okResult.Value;
        Assert.NotNull(data);

        var messageProperty = data.GetType().GetProperty("message")?.GetValue(data, null) as string;
        var idProperty = data.GetType().GetProperty("personId")?.GetValue(data, null);

        Assert.Equal("Person updated successfully!", messageProperty);
        Assert.Equal(personId, idProperty);

        mockServicce.Verify(s => s.UpdatePersonAsync(personId, personDto, testId), Times.Once);
        Console.WriteLine($"Test Passed. Message:{messageProperty}");
    }
}
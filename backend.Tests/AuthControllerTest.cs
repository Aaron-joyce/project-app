using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using backend.Services;
using backend.Controllers;
using backend.Dtos;

namespace backend.Tests;
 
public class AuthControllerTest
{
    private readonly Mock<IPersonService> mockService;
    private readonly Mock<ILogger<AuthController>> mockLogger;
    private readonly AuthController mockController;

    public AuthControllerTest()
    {
        mockService = new Mock<IPersonService>();
        mockLogger = new Mock<ILogger<AuthController>>();

        mockController = new AuthController(mockService.Object, mockLogger.Object);
    }

    [Fact]
    public async Task Login_WithValidCredentials()
    {
        Console.WriteLine("Started Login Validation");

        var loginDto = new LoginDto
        {
            EmailAddress = "test@gmail.com",
            Password = "test@123"
        };
        Console.WriteLine("Create Login DTO");
        var expectedResponse = new LoginResponseDto
        {
          Token = "fake-jwt-token",
          EmailAddress=loginDto.EmailAddress,
        };

        mockService.Setup(service=> service.AuthenticateAsync(It.Is<LoginDto>(d => d.EmailAddress == loginDto.EmailAddress)))
        .ReturnsAsync(expectedResponse);
        
        Console.WriteLine("mock service setup complete. Starting");

        var result =  await mockController.Login(loginDto);
        var okResult = Assert.IsType<OkObjectResult>(result);

        var actualResponse = Assert.IsType<LoginResponseDto>(okResult.Value);
        Assert.Equal("fake-jwt-token", actualResponse.Token);
        
        mockService.Verify(s=> s.AuthenticateAsync(It.IsAny<LoginDto>()),Times.Once);

        Console.WriteLine("Test Complete Result Verified");
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ThrowsArgumentException()
    {
        var loginDto = new LoginDto
        {
            EmailAddress = "invalid@gmail.com",
            Password = "wrongpassword"
        };

        mockService.Setup(service => service.AuthenticateAsync(It.IsAny<LoginDto>()))
            .ThrowsAsync(new ArgumentException("Invalid Email Address or Password."));

        await Assert.ThrowsAsync<ArgumentException>(() => mockController.Login(loginDto));

        mockService.Verify(s => s.AuthenticateAsync(It.IsAny<LoginDto>()), Times.Once);
    }
}


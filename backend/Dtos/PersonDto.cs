using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class PersonDto
{
    [Required(ErrorMessage = "Full Name is required.")]
    [StringLength(100, ErrorMessage = "Full Name cannot exceed 100 characters.")]
    [RegularExpression(@"^[a-zA-Z\s\-']{2,100}$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes (between 2 and 100 characters).")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phone Number is required.")]
    [Phone(ErrorMessage = "Invalid Phone Number format.")]
    [RegularExpression(@"^[0-9]{10}$", ErrorMessage = "Phone number must be exactly 10 digits.")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email Address is required.")]
    [EmailAddress(ErrorMessage = "Invalid Email Address format.")]
    [RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", ErrorMessage = "Please enter a valid email address.")]
    public string EmailAddress { get; set; } = string.Empty;

    [Required(ErrorMessage = "Shape Type is required.")]
    public string ShapeType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Geometry Data is required.")]
    public string GeometryDataJson { get; set; } = string.Empty;
}

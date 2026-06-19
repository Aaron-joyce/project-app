using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class PersonDto
{
    [Required(ErrorMessage = "Full Name is required.")]
    [StringLength(100, ErrorMessage = "Full Name cannot exceed 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phone Number is required.")]
    [Phone(ErrorMessage = "Invalid Phone Number format.")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email Address is required.")]
    [EmailAddress(ErrorMessage = "Invalid Email Address format.")]
    public string EmailAddress { get; set; } = string.Empty;

    [Required(ErrorMessage = "Shape Type is required.")]
    public string ShapeType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Geometry Data is required.")]
    public string GeometryDataJson { get; set; } = string.Empty;
}

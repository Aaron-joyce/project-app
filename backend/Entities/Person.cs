using System.ComponentModel.DataAnnotations;

namespace backend.Entities;

public class Person
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string EmailAddress { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string ShapeType { get; set; } = string.Empty;

    [Required]
    public string GeometryDataJson { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

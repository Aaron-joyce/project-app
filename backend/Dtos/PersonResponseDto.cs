using System;

namespace backend.Dtos;

public class PersonResponseDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public string ShapeType { get; set; } = string.Empty;
    public string GeometryDataJson { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

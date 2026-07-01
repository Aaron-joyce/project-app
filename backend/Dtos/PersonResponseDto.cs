using System;
using System.Collections.Generic;

namespace backend.Dtos;

public class PersonResponseDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public List<MapDrawingDto> Drawings { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

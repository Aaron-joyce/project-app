using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class MapDrawingDto
{
    public Guid? Id { get; set; }

    [Required(ErrorMessage = "Shape Type is required.")]
    [StringLength(50, ErrorMessage = "Shape Type cannot exceed 50 characters.")]
    public string ShapeType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Geometry Data is required.")]
    public string GeometryDataJson { get; set; } = string.Empty;

    [Required(ErrorMessage = "Map Name is required.")]
    [StringLength(100, ErrorMessage = "Map Name cannot exceed 100 characters.")]
    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Entities;

public class MapDrawing
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid PersonId { get; set; }

    [Required]
    [MaxLength(50)]
    public string ShapeType { get; set; } = string.Empty;

    [Required]
    public string GeometryDataJson { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign key navigation property (1-to-1 relationship)
    [ForeignKey(nameof(PersonId))]
    [JsonIgnore]
    public Person? Person { get; set; }
}

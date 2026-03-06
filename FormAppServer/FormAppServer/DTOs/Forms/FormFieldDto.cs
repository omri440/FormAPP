using System.ComponentModel.DataAnnotations;

namespace FormAppServer.DTOs.Forms;

public class FormFieldDto
{
    [Required]
    [MaxLength(300)]
    public string Label { get; set; } = string.Empty;

    [Required]
    [RegularExpression("text|number|textarea|select|checkbox",
        ErrorMessage = "FieldType must be: text, number, textarea, select, or checkbox.")]
    public string FieldType { get; set; } = "text";

    public bool IsRequired { get; set; } = false;

    public int Order { get; set; } = 0;

    // Only used when FieldType == "select" — JSON array e.g. ["Option A","Option B"]
    public string? Options { get; set; }
}

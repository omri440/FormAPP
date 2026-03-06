using System.ComponentModel.DataAnnotations;

namespace FormAppServer.DTOs.Forms;

public class CreateFormDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MinLength(1, ErrorMessage = "A form must have at least one field.")]
    public List<FormFieldDto> Fields { get; set; } = [];
}

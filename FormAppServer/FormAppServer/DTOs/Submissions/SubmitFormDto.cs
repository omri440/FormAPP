using System.ComponentModel.DataAnnotations;

namespace FormAppServer.DTOs.Submissions;

/// <summary>
/// Sent by the user when submitting a form.
/// One FieldAnswer per field in the form.
/// </summary>
public class SubmitFormDto
{
    [Required]
    [MinLength(1, ErrorMessage = "At least one field answer is required.")]
    public List<FieldAnswerDto> Answers { get; set; } = [];
}

public class FieldAnswerDto
{
    [Required]
    public int FieldId { get; set; }

    public string Value { get; set; } = string.Empty;
}

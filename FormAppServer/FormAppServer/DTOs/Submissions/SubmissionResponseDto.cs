namespace FormAppServer.DTOs.Submissions;

/// <summary>
/// Returned to the admin when viewing submissions.
/// Contains the submission header + all field answers.
/// </summary>
public class SubmissionResponseDto
{
    public int Id { get; set; }
    public int FormId { get; set; }
    public string FormTitle { get; set; } = string.Empty;
    public string SubmittedByEmail { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public List<SubmissionValueDto> Values { get; set; } = [];
}

public class SubmissionValueDto
{
    public int FieldId { get; set; }
    public string FieldLabel { get; set; } = string.Empty;
    public string FieldType { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

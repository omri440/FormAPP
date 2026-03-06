namespace FormAppServer.DTOs.Forms;

public class FormResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<FormFieldResponseDto> Fields { get; set; } = [];
}

public class FormFieldResponseDto
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string FieldType { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public int Order { get; set; }
    public string? Options { get; set; }
}

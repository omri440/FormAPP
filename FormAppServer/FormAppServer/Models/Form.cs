namespace FormAppServer.Models;

/// <summary>
/// A form created by an admin. Contains an ordered list of FormFields.
/// </summary>
public class Form
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // FK → User (admin who created this form)
    public int CreatedByUserId { get; set; }
    public User CreatedBy { get; set; } = null!;

    // Navigation properties
    public ICollection<FormField> Fields { get; set; } = [];
    public ICollection<FormEntry> Entries { get; set; } = [];
}

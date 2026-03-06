namespace FormAppServer.Models;

/// <summary>
/// One submission of a Form by a user.
/// The actual field values are stored in EntryValue rows linked to this entry.
/// </summary>
public class FormEntry
{
    public int Id { get; set; }

    // FK → Form
    public int FormId { get; set; }
    public Form Form { get; set; } = null!;

    // FK → User (the user who submitted)
    public int SubmittedByUserId { get; set; }
    public User SubmittedBy { get; set; } = null!;

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<EntryValue> Values { get; set; } = [];
}

namespace FormAppServer.Models;

/// <summary>
/// The value a user entered for one specific FormField within one FormEntry.
/// Every field in a submitted form produces one EntryValue row.
/// </summary>
public class EntryValue
{
    public int Id { get; set; }

    // FK → FormEntry
    public int FormEntryId { get; set; }
    public FormEntry FormEntry { get; set; } = null!;

    // FK → FormField (which field this value belongs to)
    public int FormFieldId { get; set; }
    public FormField FormField { get; set; } = null!;

    /// <summary>
    /// The submitted value as a string.
    /// For checkboxes this will be "true" or "false".
    /// For select it will be the selected option string.
    /// </summary>
    public string Value { get; set; } = string.Empty;
}

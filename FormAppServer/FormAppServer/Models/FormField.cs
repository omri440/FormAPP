namespace FormAppServer.Models;

/// <summary>
/// A single field inside a Form (e.g. "Full Name" of type "text").
/// FieldType must be one of: text | number | textarea | select | checkbox.
/// Options is a JSON array string used only when FieldType == "select".
/// </summary>
public class FormField
{
    public int Id { get; set; }

    // FK → Form
    public int FormId { get; set; }
    public Form Form { get; set; } = null!;

    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// Supported types: "text" | "number" | "textarea" | "select" | "checkbox"
    /// </summary>
    public string FieldType { get; set; } = "text";

    public bool IsRequired { get; set; } = false;

    /// <summary>Display order within the form (0-based).</summary>
    public int Order { get; set; } = 0;

    /// <summary>
    /// JSON string holding select options, e.g. ["Option A","Option B"].
    /// Null / empty for non-select fields.
    /// </summary>
    public string? Options { get; set; }

    // Navigation
    public ICollection<EntryValue> EntryValues { get; set; } = [];
}

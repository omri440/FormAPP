namespace FormAppServer.Models;

/// <summary>
/// Represents a registered user. Role is either "admin" or "user".
/// Password is never stored — only the BCrypt hash.
/// </summary>
public class User
{
    public int Id { get; set; }

    public string Email { get; set; } = string.Empty;

    /// <summary>BCrypt hashed password — never the plain-text value.</summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>"admin" or "user" — matches the JWT role claim the client reads.</summary>
    public string Role { get; set; } = "user";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Form> CreatedForms { get; set; } = [];
    public ICollection<FormEntry> Submissions { get; set; } = [];
}

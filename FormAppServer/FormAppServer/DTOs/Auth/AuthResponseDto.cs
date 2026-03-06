using System.Text.Json.Serialization;

namespace FormAppServer.DTOs.Auth;

public class AuthResponseDto
{
    // Matches exactly what the Angular client reads: res.access_token
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;
}

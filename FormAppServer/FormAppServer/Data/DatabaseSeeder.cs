using FormAppServer.Models;
using Microsoft.EntityFrameworkCore;

namespace FormAppServer.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // Only seed if no admin exists yet
        var adminExists = await db.Users.AnyAsync(u => u.Role == "admin");
        if (adminExists) return;

        var admin = new User
        {
            Email = "admin@formapp.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin1234!"),
            Role = "admin",
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(admin);
        await db.SaveChangesAsync();

        Console.WriteLine("✅ Admin user seeded: admin@formapp.com / Admin1234!");
    }
}

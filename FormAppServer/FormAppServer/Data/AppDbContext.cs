using FormAppServer.Models;
using Microsoft.EntityFrameworkCore;

namespace FormAppServer.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ─── DbSets ───────────────────────────────────────────────────────────────
    public DbSet<User> Users => Set<User>();
    public DbSet<Form> Forms => Set<Form>();
    public DbSet<FormField> FormFields => Set<FormField>();
    public DbSet<FormEntry> FormEntries => Set<FormEntry>();
    public DbSet<EntryValue> EntryValues => Set<EntryValue>();

    // ─── Model Configuration ──────────────────────────────────────────────────
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique(); // emails must be unique
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Role).IsRequired().HasDefaultValue("user");
        });

        // ── Form ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<Form>(entity =>
        {
            entity.HasKey(f => f.Id);
            entity.Property(f => f.Title).IsRequired().HasMaxLength(200);
            entity.Property(f => f.Description).HasMaxLength(1000);

            // Form → User (admin who created it). Restrict delete so we don't
            // lose forms if an admin user is removed.
            entity.HasOne(f => f.CreatedBy)
                  .WithMany(u => u.CreatedForms)
                  .HasForeignKey(f => f.CreatedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── FormField ─────────────────────────────────────────────────────────
        modelBuilder.Entity<FormField>(entity =>
        {
            entity.HasKey(ff => ff.Id);
            entity.Property(ff => ff.Label).IsRequired().HasMaxLength(300);
            entity.Property(ff => ff.FieldType).IsRequired().HasDefaultValue("text");

            // Cascade: deleting a Form removes all its fields
            entity.HasOne(ff => ff.Form)
                  .WithMany(f => f.Fields)
                  .HasForeignKey(ff => ff.FormId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── FormEntry ─────────────────────────────────────────────────────────
        modelBuilder.Entity<FormEntry>(entity =>
        {
            entity.HasKey(fe => fe.Id);

            // Cascade: deleting a Form removes all its entries
            entity.HasOne(fe => fe.Form)
                  .WithMany(f => f.Entries)
                  .HasForeignKey(fe => fe.FormId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Restrict: don't delete entries if user is deleted
            entity.HasOne(fe => fe.SubmittedBy)
                  .WithMany(u => u.Submissions)
                  .HasForeignKey(fe => fe.SubmittedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── EntryValue ────────────────────────────────────────────────────────
        modelBuilder.Entity<EntryValue>(entity =>
        {
            entity.HasKey(ev => ev.Id);
            entity.Property(ev => ev.Value).IsRequired();

            // Cascade: deleting a FormEntry removes all its values
            entity.HasOne(ev => ev.FormEntry)
                  .WithMany(fe => fe.Values)
                  .HasForeignKey(ev => ev.FormEntryId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Restrict: keep historical values even if a field is removed
            entity.HasOne(ev => ev.FormField)
                  .WithMany(ff => ff.EntryValues)
                  .HasForeignKey(ev => ev.FormFieldId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}

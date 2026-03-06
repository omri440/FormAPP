using FormAppServer.Data;
using FormAppServer.DTOs.Forms;
using FormAppServer.Models;
using Microsoft.EntityFrameworkCore;

namespace FormAppServer.Services;

public class FormsService : IFormsService
{
    private readonly AppDbContext _db;

    public FormsService(AppDbContext db)
    {
        _db = db;
    }

    // GET all forms — returns list without fields (summary view)
    public async Task<List<FormResponseDto>> GetAllFormsAsync()
    {
        return await _db.Forms
            .Include(f => f.Fields)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => MapToDto(f))
            .ToListAsync();
    }

    // GET one form with all its fields
    public async Task<FormResponseDto?> GetFormByIdAsync(int id)
    {
        var form = await _db.Forms
            .Include(f => f.Fields.OrderBy(ff => ff.Order))
            .FirstOrDefaultAsync(f => f.Id == id);

        return form is null ? null : MapToDto(form);
    }

    // POST — admin creates a form with fields
    public async Task<FormResponseDto> CreateFormAsync(CreateFormDto dto, int adminId)
    {
        var form = new Form
        {
            Title = dto.Title,
            Description = dto.Description,
            CreatedByUserId = adminId,
            CreatedAt = DateTime.UtcNow,
            Fields = dto.Fields.Select((f, index) => new FormField
            {
                Label = f.Label,
                FieldType = f.FieldType,
                IsRequired = f.IsRequired,
                Order = f.Order == 0 ? index : f.Order,
                Options = f.Options
            }).ToList()
        };

        _db.Forms.Add(form);
        await _db.SaveChangesAsync();

        return MapToDto(form);
    }

    // DELETE — admin deletes a form (cascade removes fields + entries)
    // Must eager-load all children so EF Core deletes EntryValues before
    // FormFields — otherwise the RESTRICT FK on EntryValues.FormFieldId fails.
    public async Task<bool> DeleteFormAsync(int id)
    {
        var form = await _db.Forms
            .Include(f => f.Fields)
            .Include(f => f.Entries)
                .ThenInclude(e => e.Values)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (form is null) return false;

        _db.Forms.Remove(form);
        await _db.SaveChangesAsync();
        return true;
    }

    // ─── Mapper ───────────────────────────────────────────────────────────────
    private static FormResponseDto MapToDto(Form form) => new()
    {
        Id = form.Id,
        Title = form.Title,
        Description = form.Description,
        CreatedAt = form.CreatedAt,
        Fields = form.Fields.Select(ff => new FormFieldResponseDto
        {
            Id = ff.Id,
            Label = ff.Label,
            FieldType = ff.FieldType,
            IsRequired = ff.IsRequired,
            Order = ff.Order,
            Options = ff.Options
        }).ToList()
    };
}

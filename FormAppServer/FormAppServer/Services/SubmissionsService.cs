using ClosedXML.Excel;
using FormAppServer.Data;
using FormAppServer.DTOs.Submissions;
using FormAppServer.Models;
using Microsoft.EntityFrameworkCore;

namespace FormAppServer.Services;

public class SubmissionsService : ISubmissionsService
{
    private readonly AppDbContext _db;

    public SubmissionsService(AppDbContext db)
    {
        _db = db;
    }

    // POST — user submits a form
    // Saves FormEntry + all EntryValues in one transaction
    public async Task<SubmissionResponseDto> SubmitFormAsync(int formId, int userId, SubmitFormDto dto)
    {
        // Verify the form exists
        var form = await _db.Forms
            .Include(f => f.Fields)
            .FirstOrDefaultAsync(f => f.Id == formId)
            ?? throw new KeyNotFoundException("Form not found.");

        // Validate all required fields are answered
        var requiredFieldIds = form.Fields
            .Where(f => f.IsRequired)
            .Select(f => f.Id)
            .ToHashSet();

        var answeredFieldIds = dto.Answers
            .Select(a => a.FieldId)
            .ToHashSet();

        var missingFields = requiredFieldIds.Except(answeredFieldIds).ToList();
        if (missingFields.Count > 0)
            throw new InvalidOperationException("Some required fields are missing.");

        // Build the FormEntry and all EntryValues — save as one transaction
        var entry = new FormEntry
        {
            FormId = formId,
            SubmittedByUserId = userId,
            SubmittedAt = DateTime.UtcNow,
            Values = dto.Answers.Select(a => new EntryValue
            {
                FormFieldId = a.FieldId,
                Value = a.Value
            }).ToList()
        };

        _db.FormEntries.Add(entry);
        await _db.SaveChangesAsync();

        // Reload with full relations for the response
        return await BuildResponseDto(entry.Id);
    }

    // GET all submissions — admin view
    public async Task<List<SubmissionResponseDto>> GetAllSubmissionsAsync()
    {
        var entries = await _db.FormEntries
            .Include(e => e.Form)
            .Include(e => e.SubmittedBy)
            .Include(e => e.Values)
                .ThenInclude(v => v.FormField)
            .OrderByDescending(e => e.SubmittedAt)
            .ToListAsync();

        return entries.Select(MapToDto).ToList();
    }

    // GET submissions for the current user — user view
    public async Task<List<SubmissionResponseDto>> GetMySubmissionsAsync(int userId)
    {
        var entries = await _db.FormEntries
            .Include(e => e.Form)
            .Include(e => e.SubmittedBy)
            .Include(e => e.Values)
                .ThenInclude(v => v.FormField)
            .Where(e => e.SubmittedByUserId == userId)
            .OrderByDescending(e => e.SubmittedAt)
            .ToListAsync();

        return entries.Select(MapToDto).ToList();
    }

    // GET one submission by ID — admin view
    public async Task<SubmissionResponseDto?> GetSubmissionByIdAsync(int id)
    {
        var entry = await _db.FormEntries
            .Include(e => e.Form)
            .Include(e => e.SubmittedBy)
            .Include(e => e.Values)
                .ThenInclude(v => v.FormField)
            .FirstOrDefaultAsync(e => e.Id == id);

        return entry is null ? null : MapToDto(entry);
    }

    // GET export submissions — admin view
    public async Task<byte[]> ExportSubmissionsExcelAsync()
    {
        var entries = await _db.FormEntries
            .Include(e => e.Form)
            .Include(e => e.SubmittedBy)
            .Include(e => e.Values)
                .ThenInclude(v => v.FormField)
            .OrderByDescending(e => e.SubmittedAt)
            .ToListAsync();

        var fieldLabels = entries
            .SelectMany(e => e.Values.Select(v => new
            {
                Label = v.FormField.Label,
                v.FormField.Order,
                FormTitle = e.Form.Title
            }))
            .OrderBy(x => x.FormTitle)
            .ThenBy(x => x.Order)
            .ThenBy(x => x.Label)
            .Select(x => x.Label)
            .Distinct()
            .ToList();

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Submissions");

        worksheet.Cell(1, 1).Value = "ID";
        worksheet.Cell(1, 2).Value = "Form Name";
        worksheet.Cell(1, 3).Value = "Submitted By";
        worksheet.Cell(1, 4).Value = "Date";

        for (var i = 0; i < fieldLabels.Count; i++)
        {
            worksheet.Cell(1, 5 + i).Value = fieldLabels[i];
        }

        for (var i = 0; i < entries.Count; i++)
        {
            var entry = entries[i];
            var row = i + 2;

            worksheet.Cell(row, 1).Value = entry.Id;
            worksheet.Cell(row, 2).Value = entry.Form.Title;
            worksheet.Cell(row, 3).Value = entry.SubmittedBy.Email;
            worksheet.Cell(row, 4).Value = entry.SubmittedAt;
            worksheet.Cell(row, 4).Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";

            var valuesByLabel = entry.Values
                .GroupBy(v => v.FormField.Label)
                .ToDictionary(g => g.Key, g => string.Join(", ", g.Select(v => v.Value)));

            for (var j = 0; j < fieldLabels.Count; j++)
            {
                if (valuesByLabel.TryGetValue(fieldLabels[j], out var value))
                {
                    worksheet.Cell(row, 5 + j).Value = value;
                }
            }
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private async Task<SubmissionResponseDto> BuildResponseDto(int entryId)
    {
        var entry = await _db.FormEntries
            .Include(e => e.Form)
            .Include(e => e.SubmittedBy)
            .Include(e => e.Values)
                .ThenInclude(v => v.FormField)
            .FirstAsync(e => e.Id == entryId);

        return MapToDto(entry);
    }

    private static SubmissionResponseDto MapToDto(FormEntry entry) => new()
    {
        Id = entry.Id,
        FormId = entry.FormId,
        FormTitle = entry.Form.Title,
        SubmittedByEmail = entry.SubmittedBy.Email,
        SubmittedAt = entry.SubmittedAt,
        Values = entry.Values.Select(v => new SubmissionValueDto
        {
            FieldId = v.FormFieldId,
            FieldLabel = v.FormField.Label,
            FieldType = v.FormField.FieldType,
            Value = v.Value
        }).ToList()
    };
}

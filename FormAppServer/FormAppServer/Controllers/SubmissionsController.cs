using System.Security.Claims;
using FormAppServer.DTOs.Submissions;
using FormAppServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FormAppServer.Controllers;

[ApiController]
[Authorize]
public class SubmissionsController : ControllerBase
{
    private readonly ISubmissionsService _submissionsService;

    public SubmissionsController(ISubmissionsService submissionsService)
    {
        _submissionsService = submissionsService;
    }

    // POST api/forms/{id}/submit — any authenticated user
    [HttpPost("api/forms/{formId:int}/submit")]
    public async Task<IActionResult> Submit(int formId, [FromBody] SubmitFormDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim = User.FindFirstValue("sub");
        if (userIdClaim is null || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token." });

        try
        {
            var result = await _submissionsService.SubmitFormAsync(formId, userId, dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET api/submissions/my — current user's own submissions
    [HttpGet("api/submissions/my")]
    public async Task<IActionResult> GetMine()
    {
        var userIdClaim = User.FindFirstValue("sub");
        if (userIdClaim is null || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token." });

        var submissions = await _submissionsService.GetMySubmissionsAsync(userId);
        return Ok(submissions);
    }

    // GET api/submissions — admin only
    [HttpGet("api/submissions")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAll()
    {
        var submissions = await _submissionsService.GetAllSubmissionsAsync();
        return Ok(submissions);
    }

    // GET api/submissions/{id} — admin only
    [HttpGet("api/submissions/{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetById(int id)
    {
        var submission = await _submissionsService.GetSubmissionByIdAsync(id);
        if (submission is null)
            return NotFound(new { message = "Submission not found." });

        return Ok(submission);
    }

    // GET api/submissions/export/excel — admin only
    [HttpGet("api/submissions/export/excel")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ExportExcel()
    {
        var fileBytes = await _submissionsService.ExportSubmissionsExcelAsync();
        const string contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        return File(fileBytes, contentType, "submissions.xlsx");
    }
}

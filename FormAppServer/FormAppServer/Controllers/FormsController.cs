using System.Security.Claims;
using FormAppServer.DTOs.Forms;
using FormAppServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FormAppServer.Controllers;

[ApiController]
[Route("api/forms")]
[Authorize]
public class FormsController : ControllerBase
{
    private readonly IFormsService _formsService;

    public FormsController(IFormsService formsService)
    {
        _formsService = formsService;
    }

    // GET api/forms — any authenticated user
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var forms = await _formsService.GetAllFormsAsync();
        return Ok(forms);
    }

    // GET api/forms/{id} — any authenticated user
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var form = await _formsService.GetFormByIdAsync(id);
        if (form is null)
            return NotFound(new { message = "Form not found." });

        return Ok(form);
    }

    // POST api/forms — admin only
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateFormDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Read admin ID from the "sub" claim (MapInboundClaims = false, so no remapping)
        var adminIdClaim = User.FindFirstValue("sub");

        if (adminIdClaim is null || !int.TryParse(adminIdClaim, out var adminId))
            return Unauthorized(new { message = "Invalid token." });

        var form = await _formsService.CreateFormAsync(dto, adminId);
        return CreatedAtAction(nameof(GetById), new { id = form.Id }, form);
    }

    // DELETE api/forms/{id} — admin only
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _formsService.DeleteFormAsync(id);
        if (!deleted)
            return NotFound(new { message = "Form not found." });

        return NoContent();
    }
}

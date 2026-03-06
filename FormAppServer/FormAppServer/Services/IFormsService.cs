using FormAppServer.DTOs.Forms;

namespace FormAppServer.Services;

public interface IFormsService
{
    Task<List<FormResponseDto>> GetAllFormsAsync();
    Task<FormResponseDto?> GetFormByIdAsync(int id);
    Task<FormResponseDto> CreateFormAsync(CreateFormDto dto, int adminId);
    Task<bool> DeleteFormAsync(int id);
}

using FormAppServer.DTOs.Submissions;

namespace FormAppServer.Services;

public interface ISubmissionsService
{
    Task<SubmissionResponseDto> SubmitFormAsync(int formId, int userId, SubmitFormDto dto);
    Task<List<SubmissionResponseDto>> GetAllSubmissionsAsync();
    Task<List<SubmissionResponseDto>> GetMySubmissionsAsync(int userId);
    Task<SubmissionResponseDto?> GetSubmissionByIdAsync(int id);
    Task<byte[]> ExportSubmissionsExcelAsync();
}

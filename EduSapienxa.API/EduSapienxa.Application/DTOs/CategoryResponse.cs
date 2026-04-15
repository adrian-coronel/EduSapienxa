namespace EduSapienxa.Application.DTOs;

public record CategoryResponse(
    int Id,
    string Name,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt);

namespace EduSapienxa.Application.DTOs;

public record AppUserResponse(
    string Id,
    string Name,
    string Email,
    string Role,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt);

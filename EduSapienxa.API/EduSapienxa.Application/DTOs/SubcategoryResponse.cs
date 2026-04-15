namespace EduSapienxa.Application.DTOs;

public record SubcategoryResponse(
    int Id,
    string Name,
    string? Description,
    bool IsActive,
    int CategoryId,
    DateTime CreatedAt,
    DateTime UpdatedAt);

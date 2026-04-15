namespace EduSapienxa.Application.DTOs;

public record CategoryWithSubsResponse(
    int Id,
    string Name,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    SubcategoryResponse[] Subcategories);

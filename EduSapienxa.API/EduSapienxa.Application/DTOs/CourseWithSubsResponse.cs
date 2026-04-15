namespace EduSapienxa.Application.DTOs;

public record CourseWithSubsResponse(
    int Id,
    string Name,
    string? Description,
    decimal Price,
    string CheckoutUrl,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    SubcategoryResponse[] Subcategories);

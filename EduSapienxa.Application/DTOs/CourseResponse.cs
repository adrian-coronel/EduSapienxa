namespace EduSapienxa.Application.DTOs;

public record CourseResponse(
    int Id,
    string Name,
    string? Description,
    decimal Price,
    string CheckoutUrl,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt);

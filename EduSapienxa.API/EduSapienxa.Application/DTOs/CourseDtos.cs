namespace EduSapienxa.Application.DTOs;

public record CreateCourseRequest(string Name, string? Description, decimal Price, string CheckoutUrl, bool? IsActive = null);
public record UpdateCourseRequest(string Name, string? Description, decimal Price, string CheckoutUrl, bool? IsActive = null);

namespace EduSapienxa.Application.DTOs;

public record CreateCategoryRequest(string Name, string? Description, bool? IsActive = null);
public record UpdateCategoryRequest(string Name, string? Description, bool? IsActive = null);

namespace EduSapienxa.Application.DTOs;

public record CreateSubcategoryRequest(string Name, string? Description, int CategoryId, bool? IsActive = null);
public record UpdateSubcategoryRequest(string Name, string? Description, int CategoryId, bool? IsActive = null);

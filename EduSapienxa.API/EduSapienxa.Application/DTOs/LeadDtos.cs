namespace EduSapienxa.Application.DTOs;

public record CreateLeadRequest(string Name, string? Email, string? WhatsAppId, string Source = "manual", string? Notes = null);
public record UpdateLeadRequest(string Name, string? Email, string? WhatsAppId, string Status, string? Notes);
public record AddInterestRequest(int? CourseId, int? SubcategoryId, int? CategoryId);

public record LeadDetailResponse(
    int Id,
    string Name,
    string? Email,
    string? WhatsAppId,
    string Status,
    string Source,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IReadOnlyCollection<LeadInterestResponse> Interests,
    IReadOnlyCollection<LeadPurchaseResponse> Purchases);

public record LeadInterestResponse(
    int Id,
    int LeadId,
    int? CourseId,
    int? SubcategoryId,
    int? CategoryId,
    DateTime CreatedAt,
    CourseSummaryResponse? Course,
    SubcategorySummaryResponse? Subcategory,
    CategorySummaryResponse? Category);

public record LeadPurchaseResponse(
    int Id,
    int LeadId,
    int CourseId,
    decimal AmountPaid,
    string RegisteredById,
    string? Notes,
    DateTime PurchasedAt,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    CourseSummaryResponse Course);

public record CourseSummaryResponse(
    int Id,
    string Name,
    string? Description,
    decimal Price,
    string? CheckoutUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record SubcategorySummaryResponse(
    int Id,
    int CategoryId,
    string Name,
    string? Description,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CategorySummaryResponse(
    int Id,
    string Name,
    string? Description,
    DateTime CreatedAt,
    DateTime UpdatedAt);

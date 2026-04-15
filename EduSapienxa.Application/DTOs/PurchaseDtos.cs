namespace EduSapienxa.Application.DTOs;

public record CreatePurchaseRequest(int LeadId, int CourseId, decimal AmountPaid, string? Notes);

public record PurchaseResponse(
    int Id,
    int LeadId,
    int CourseId,
    decimal AmountPaid,
    string RegisteredById,
    string? Notes,
    DateTime PurchasedAt,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    LeadResponse? Lead,
    CourseResponse? Course,
    AppUserResponse? RegisteredBy);

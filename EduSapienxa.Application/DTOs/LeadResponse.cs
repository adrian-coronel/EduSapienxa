namespace EduSapienxa.Application.DTOs;

public record LeadResponse(
    int Id,
    string Name,
    string? Email,
    string? WhatsAppId,
    string Status,
    string Source,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? LastInteraction);

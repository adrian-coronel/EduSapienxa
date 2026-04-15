using EduSapienxa.Application.DTOs;
using EduSapienxa.Application.Interfaces;
using EduSapienxa.Domain.Entities;

namespace EduSapienxa.Application.Services;

public class PurchaseService
{
    private readonly IPurchaseRepository _purchases;

    public PurchaseService(IPurchaseRepository purchases)
    {
        _purchases = purchases;
    }

    public async Task<IEnumerable<PurchaseResponse>> GetAllPurchasesAsync()
    {
        var purchases = await _purchases.GetAllWithDetailsAsync();
        return purchases.Select(MapPurchaseResponse).ToArray();
    }

    public async Task<IEnumerable<PurchaseResponse>> GetPurchasesByLeadAsync(int leadId)
    {
        var purchases = await _purchases.GetByLeadAsync(leadId);
        return purchases.Select(MapPurchaseResponse).ToArray();
    }

    public async Task<PurchaseResponse> RegisterPurchaseAsync(int leadId, int courseId, decimal amountPaid, string registeredById, string? notes)
    {
        var purchase = new Purchase
        {
            LeadId = leadId,
            CourseId = courseId,
            AmountPaid = amountPaid,
            RegisteredById = registeredById,
            Notes = notes,
            PurchasedAt = DateTime.UtcNow
        };
        await _purchases.AddAsync(purchase);
        await _purchases.SaveChangesAsync();
        return MapPurchaseResponse(purchase);
    }

    private static PurchaseResponse MapPurchaseResponse(Purchase purchase) =>
        new(
            purchase.Id,
            purchase.LeadId,
            purchase.CourseId,
            purchase.AmountPaid,
            purchase.RegisteredById,
            purchase.Notes,
            purchase.PurchasedAt,
            purchase.CreatedAt,
            purchase.UpdatedAt,
            purchase.Lead is null
                ? null
                : new LeadResponse(
                    purchase.Lead.Id,
                    purchase.Lead.Name,
                    purchase.Lead.Email,
                    purchase.Lead.WhatsAppId,
                    purchase.Lead.Status,
                    purchase.Lead.Source,
                    purchase.Lead.Notes,
                    purchase.Lead.CreatedAt,
                    purchase.Lead.UpdatedAt,
                    purchase.Lead.LastInteraction),
            purchase.Course is null
                ? null
                : new CourseResponse(
                    purchase.Course.Id,
                    purchase.Course.Name,
                    purchase.Course.Description,
                    purchase.Course.Price,
                    purchase.Course.CheckoutUrl,
                    purchase.Course.IsActive,
                    purchase.Course.CreatedAt,
                    purchase.Course.UpdatedAt),
            purchase.RegisteredBy is null
                ? null
                : new AppUserResponse(
                    purchase.RegisteredBy.Id,
                    purchase.RegisteredBy.Name,
                    purchase.RegisteredBy.Email,
                    purchase.RegisteredBy.Role,
                    purchase.RegisteredBy.IsActive,
                    purchase.RegisteredBy.CreatedAt,
                    purchase.RegisteredBy.UpdatedAt));
}

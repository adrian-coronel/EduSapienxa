using EduSapienxa.Application.DTOs;
using EduSapienxa.Application.Interfaces;
using EduSapienxa.Domain.Entities;

namespace EduSapienxa.Application.Services;

public class LeadService
{
    private readonly ILeadRepository _leads;

    public LeadService(ILeadRepository leads)
    {
        _leads = leads;
    }

    public async Task<IEnumerable<LeadResponse>> GetLeadsAsync()
    {
        var leads = await _leads.GetAllAsync();
        return leads.Select(MapLeadResponse).ToArray();
    }

    public async Task<IEnumerable<LeadResponse>> GetLeadsByStatusAsync(string status)
    {
        var leads = await _leads.GetByStatusAsync(status);
        return leads.Select(MapLeadResponse).ToArray();
    }

    public async Task<LeadDetailResponse?> GetLeadAsync(int id)
    {
        var lead = await _leads.GetWithInterestsAsync(id);
        if (lead is null) return null;

        var interests = lead.Interests
            .Select(i => new LeadInterestResponse(
                i.Id,
                i.LeadId,
                i.CourseId,
                i.SubcategoryId,
                i.CategoryId,
                i.CreatedAt,
                i.Course is null
                    ? null
                    : new CourseSummaryResponse(
                        i.Course.Id,
                        i.Course.Name,
                        i.Course.Description,
                        i.Course.Price,
                        i.Course.CheckoutUrl,
                        i.Course.CreatedAt,
                        i.Course.UpdatedAt),
                i.Subcategory is null
                    ? null
                    : new SubcategorySummaryResponse(
                        i.Subcategory.Id,
                        i.Subcategory.CategoryId,
                        i.Subcategory.Name,
                        i.Subcategory.Description,
                        i.Subcategory.CreatedAt,
                        i.Subcategory.UpdatedAt),
                i.Category is null
                    ? null
                    : new CategorySummaryResponse(
                        i.Category.Id,
                        i.Category.Name,
                        i.Category.Description,
                        i.Category.CreatedAt,
                        i.Category.UpdatedAt)))
            .ToArray();

        var purchases = lead.Purchases
            .Select(p => new LeadPurchaseResponse(
                p.Id,
                p.LeadId,
                p.CourseId,
                p.AmountPaid,
                p.RegisteredById,
                p.Notes,
                p.PurchasedAt,
                p.CreatedAt,
                p.UpdatedAt,
                new CourseSummaryResponse(
                    p.Course.Id,
                    p.Course.Name,
                    p.Course.Description,
                    p.Course.Price,
                    p.Course.CheckoutUrl,
                    p.Course.CreatedAt,
                    p.Course.UpdatedAt)))
            .ToArray();

        return new LeadDetailResponse(
            lead.Id,
            lead.Name,
            lead.Email,
            lead.WhatsAppId,
            lead.Status,
            lead.Source,
            lead.Notes,
            lead.CreatedAt,
            lead.UpdatedAt,
            interests,
            purchases);
    }

    public async Task<LeadResponse> CreateLeadAsync(string name, string? email, string? whatsAppId, string source = "manual", string? notes = null)
    {
        var lead = new Lead
        {
            Name = name,
            Email = email,
            WhatsAppId = whatsAppId,
            Source = source,
            Notes = notes
        };
        await _leads.AddAsync(lead);
        await _leads.SaveChangesAsync();
        return MapLeadResponse(lead);
    }

    public async Task<LeadResponse?> UpdateLeadAsync(int id, string name, string? email, string? whatsAppId, string status, string? notes)
    {
        var lead = await _leads.GetByIdAsync(id);
        if (lead is null) return null;

        lead.Name = name;
        lead.Email = email;
        lead.WhatsAppId = whatsAppId;
        lead.Status = status;
        lead.Notes = notes;
        lead.UpdatedAt = DateTime.UtcNow;
        lead.LastInteraction = DateTime.UtcNow;

        _leads.Update(lead);
        await _leads.SaveChangesAsync();
        return MapLeadResponse(lead);
    }

    public async Task<LeadInterest?> AddInterestAsync(int leadId, int? courseId, int? subcategoryId, int? categoryId)
    {
        var lead = await _leads.GetByIdAsync(leadId);
        if (lead is null) return null;

        var interest = new LeadInterest
        {
            LeadId = leadId,
            CourseId = courseId,
            SubcategoryId = subcategoryId,
            CategoryId = categoryId,
            CreatedAt = DateTime.UtcNow
        };
        lead.Interests.Add(interest);
        lead.UpdatedAt = DateTime.UtcNow;
        lead.LastInteraction = DateTime.UtcNow;
        await _leads.SaveChangesAsync();
        return interest;
    }

    private static LeadResponse MapLeadResponse(Lead lead) =>
        new(
            lead.Id,
            lead.Name,
            lead.Email,
            lead.WhatsAppId,
            lead.Status,
            lead.Source,
            lead.Notes,
            lead.CreatedAt,
            lead.UpdatedAt,
            lead.LastInteraction);
}

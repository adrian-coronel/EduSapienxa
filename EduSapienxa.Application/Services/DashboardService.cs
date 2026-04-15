using EduSapienxa.Application.Interfaces;
using EduSapienxa.Domain.Entities;

namespace EduSapienxa.Application.Services;

public record DashboardSummary(int TotalLeads, int TotalPurchases, decimal TotalRevenue, int ConvertedLeads);
public record TopCourse(int CourseId, string CourseName, int InterestCount, int PurchaseCount);

public class DashboardService
{
    private readonly IRepository<Lead> _leads;
    private readonly IPurchaseRepository _purchases;
    private readonly ILeadInterestRepository _interests;

    public DashboardService(
        IRepository<Lead> leads,
        IPurchaseRepository purchases,
        ILeadInterestRepository interests)
    {
        _leads = leads;
        _purchases = purchases;
        _interests = interests;
    }

    public async Task<DashboardSummary> GetSummaryAsync()
    {
        var leads = await _leads.GetAllAsync();
        var purchases = await _purchases.GetAllWithDetailsAsync();

        var purchaseList = purchases.ToList();
        var leadList = leads.ToList();

        return new DashboardSummary(
            TotalLeads: leadList.Count,
            TotalPurchases: purchaseList.Count,
            TotalRevenue: purchaseList.Sum(p => p.AmountPaid),
            ConvertedLeads: purchaseList.Select(p => p.LeadId).Distinct().Count()
        );
    }

    public async Task<IEnumerable<TopCourse>> GetTopCoursesAsync()
    {
        var interests = await _interests.GetAllWithCourseAsync();
        var purchases = await _purchases.GetAllWithDetailsAsync();

        var interestList = interests.ToList();
        var purchaseList = purchases.ToList();

        var interestGroups = interestList
            .Where(i => i.CourseId.HasValue)
            .GroupBy(i => i.CourseId!.Value)
            .ToDictionary(g => g.Key, g => g.Count());

        var purchaseGroups = purchaseList
            .GroupBy(p => p.CourseId)
            .ToDictionary(g => g.Key, g => g.Count());

        // Build a name lookup: prefer name from purchases, fall back to interests
        var courseNameFromPurchase = purchaseList
            .GroupBy(p => p.CourseId)
            .ToDictionary(g => g.Key, g => g.First().Course?.Name);

        var courseNameFromInterest = interestList
            .Where(i => i.CourseId.HasValue && i.Course != null)
            .GroupBy(i => i.CourseId!.Value)
            .ToDictionary(g => g.Key, g => g.First().Course!.Name);

        var allCourseIds = interestGroups.Keys.Union(purchaseGroups.Keys);

        return allCourseIds
            .Select(courseId =>
            {
                var name = courseNameFromPurchase.GetValueOrDefault(courseId)
                    ?? courseNameFromInterest.GetValueOrDefault(courseId)
                    ?? $"Curso #{courseId}";

                return new TopCourse(
                    CourseId: courseId,
                    CourseName: name,
                    InterestCount: interestGroups.GetValueOrDefault(courseId),
                    PurchaseCount: purchaseGroups.GetValueOrDefault(courseId)
                );
            })
            .OrderByDescending(c => c.PurchaseCount + c.InterestCount);
    }
}

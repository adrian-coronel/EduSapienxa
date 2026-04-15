using EduSapienxa.Application.DTOs;
using EduSapienxa.Application.Interfaces;

namespace EduSapienxa.Application.Services;

public class RecommendationService
{
    private readonly ICourseRepository _courses;

    public RecommendationService(ICourseRepository courses)
    {
        _courses = courses;
    }

    public async Task<IEnumerable<CourseResponse>> GetRecommendationsForLeadAsync(int leadId)
    {
        var courses = await _courses.GetAvailableForLeadAsync(leadId);
        return courses.Select(c => new CourseResponse(
            c.Id,
            c.Name,
            c.Description,
            c.Price,
            c.CheckoutUrl,
            c.IsActive,
            c.CreatedAt,
            c.UpdatedAt));
    }
}

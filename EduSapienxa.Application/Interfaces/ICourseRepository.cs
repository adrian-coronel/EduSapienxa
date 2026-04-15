using EduSapienxa.Domain.Entities;

namespace EduSapienxa.Application.Interfaces;

public interface ICourseRepository : IRepository<Course>
{
    Task<Course?> GetWithSubcategoriesAsync(int id);
    Task<IEnumerable<Course>> GetBySubcategoryAsync(int subcategoryId);
    Task<IEnumerable<Course>> GetAvailableForLeadAsync(int leadId);
}

using EduSapienxa.Application.Interfaces;
using EduSapienxa.Domain.Entities;
using EduSapienxa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EduSapienxa.Infrastructure.Repositories;

public class CourseRepository : Repository<Course>, ICourseRepository
{
    public CourseRepository(AppDbContext context) : base(context) { }

    public async Task<Course?> GetWithSubcategoriesAsync(int id) =>
        await _dbSet
            .Include(c => c.CourseSubcategories)
                .ThenInclude(cs => cs.Subcategory)
                    .ThenInclude(s => s.Category)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<IEnumerable<Course>> GetBySubcategoryAsync(int subcategoryId) =>
        await _dbSet
            .Where(c => c.CourseSubcategories.Any(cs => cs.SubcategoryId == subcategoryId))
            .ToListAsync();

    public async Task<IEnumerable<Course>> GetAvailableForLeadAsync(int leadId)
    {
        var purchasedCourseIds = await _context.Purchases
            .Where(p => p.LeadId == leadId)
            .Select(p => p.CourseId)
            .ToListAsync();

        return await _dbSet
            .Where(c => !purchasedCourseIds.Contains(c.Id))
            .Include(c => c.CourseSubcategories)
                .ThenInclude(cs => cs.Subcategory)
            .ToListAsync();
    }
}

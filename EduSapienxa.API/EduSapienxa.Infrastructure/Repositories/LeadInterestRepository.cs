using EduSapienxa.Application.Interfaces;
using EduSapienxa.Domain.Entities;
using EduSapienxa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EduSapienxa.Infrastructure.Repositories;

public class LeadInterestRepository : Repository<LeadInterest>, ILeadInterestRepository
{
    public LeadInterestRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<LeadInterest>> GetAllWithCourseAsync() =>
        await _dbSet.Include(i => i.Course).ToListAsync();
}

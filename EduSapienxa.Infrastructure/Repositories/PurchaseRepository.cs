using EduSapienxa.Application.Interfaces;
using EduSapienxa.Domain.Entities;
using EduSapienxa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EduSapienxa.Infrastructure.Repositories;

public class PurchaseRepository : Repository<Purchase>, IPurchaseRepository
{
    public PurchaseRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Purchase>> GetByLeadAsync(int leadId) =>
        await _dbSet
            .AsNoTracking()
            .Where(p => p.LeadId == leadId)
            .Include(p => p.Course)
            .Include(p => p.RegisteredBy)
            .ToListAsync();

    public async Task<IEnumerable<Purchase>> GetAllWithDetailsAsync() =>
        await _dbSet
            .AsNoTracking()
            .Include(p => p.Lead)
            .Include(p => p.Course)
            .Include(p => p.RegisteredBy)
            .ToListAsync();
}

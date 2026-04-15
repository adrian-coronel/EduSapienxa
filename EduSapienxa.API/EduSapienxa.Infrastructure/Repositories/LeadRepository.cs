using EduSapienxa.Application.Interfaces;
using EduSapienxa.Domain.Entities;
using EduSapienxa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EduSapienxa.Infrastructure.Repositories;

public class LeadRepository : Repository<Lead>, ILeadRepository
{
    public LeadRepository(AppDbContext context) : base(context) { }

    public async Task<Lead?> GetByWhatsAppIdAsync(string whatsAppId) =>
        await _dbSet.FirstOrDefaultAsync(l => l.WhatsAppId == whatsAppId);

    public async Task<Lead?> GetWithInterestsAsync(int id) =>
        await _dbSet
            .AsSplitQuery()
            .Include(l => l.Interests)
                .ThenInclude(i => i.Course)
            .Include(l => l.Interests)
                .ThenInclude(i => i.Subcategory)
            .Include(l => l.Interests)
                .ThenInclude(i => i.Category)
            .Include(l => l.Purchases)
                .ThenInclude(p => p.Course)
            .FirstOrDefaultAsync(l => l.Id == id);

    public async Task<IEnumerable<Lead>> GetByStatusAsync(string status) =>
        await _dbSet.Where(l => l.Status == status).ToListAsync();
}

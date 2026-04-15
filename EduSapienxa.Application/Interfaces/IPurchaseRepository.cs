using EduSapienxa.Domain.Entities;

namespace EduSapienxa.Application.Interfaces;

public interface IPurchaseRepository : IRepository<Purchase>
{
    Task<IEnumerable<Purchase>> GetByLeadAsync(int leadId);
    Task<IEnumerable<Purchase>> GetAllWithDetailsAsync();
}

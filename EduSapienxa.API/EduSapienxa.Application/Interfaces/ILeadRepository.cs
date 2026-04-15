using EduSapienxa.Domain.Entities;

namespace EduSapienxa.Application.Interfaces;

public interface ILeadRepository : IRepository<Lead>
{
    Task<Lead?> GetByWhatsAppIdAsync(string whatsAppId);
    Task<Lead?> GetWithInterestsAsync(int id);
    Task<IEnumerable<Lead>> GetByStatusAsync(string status);
}

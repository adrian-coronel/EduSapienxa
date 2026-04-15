using EduSapienxa.Domain.Entities;

namespace EduSapienxa.Application.Interfaces;

public interface ILeadInterestRepository : IRepository<LeadInterest>
{
    Task<IEnumerable<LeadInterest>> GetAllWithCourseAsync();
}

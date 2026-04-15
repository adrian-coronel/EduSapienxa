namespace EduSapienxa.Domain.Entities;

public class Lead
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? WhatsAppId { get; set; }
    public string Status { get; set; } = "new";
    public string Source { get; set; } = "manual";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? LastInteraction { get; set; }

    public ICollection<LeadInterest> Interests { get; set; } = new List<LeadInterest>();
    public ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();
}

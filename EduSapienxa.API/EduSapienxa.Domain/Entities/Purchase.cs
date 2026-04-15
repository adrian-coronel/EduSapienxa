namespace EduSapienxa.Domain.Entities;

public class Purchase
{
    public int Id { get; set; }
    public int LeadId { get; set; }
    public int CourseId { get; set; }
    public decimal AmountPaid { get; set; }
    public string RegisteredById { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime PurchasedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Lead Lead { get; set; } = null!;
    public Course Course { get; set; } = null!;
    public AppUser RegisteredBy { get; set; } = null!;
}

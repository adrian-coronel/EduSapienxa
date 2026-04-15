namespace EduSapienxa.Domain.Entities;

public class Course
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string CheckoutUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<CourseSubcategory> CourseSubcategories { get; set; } = new List<CourseSubcategory>();
    public ICollection<LeadInterest> LeadInterests { get; set; } = new List<LeadInterest>();
    public ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();
}

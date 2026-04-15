namespace EduSapienxa.Domain.Entities;

public class LeadInterest
{
    public int Id { get; set; }
    public int LeadId { get; set; }
    public int? CourseId { get; set; }
    public int? SubcategoryId { get; set; }
    public int? CategoryId { get; set; }
    public DateTime CreatedAt { get; set; }

    public Lead Lead { get; set; } = null!;
    public Course? Course { get; set; }
    public Subcategory? Subcategory { get; set; }
    public Category? Category { get; set; }
}

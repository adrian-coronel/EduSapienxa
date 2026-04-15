namespace EduSapienxa.Domain.Entities;

public class Subcategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public int CategoryId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Category Category { get; set; } = null!;
    public ICollection<CourseSubcategory> CourseSubcategories { get; set; } = new List<CourseSubcategory>();
}

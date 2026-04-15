namespace EduSapienxa.Domain.Entities;

public class CourseSubcategory
{
    public int CourseId { get; set; }
    public int SubcategoryId { get; set; }

    public Course Course { get; set; } = null!;
    public Subcategory Subcategory { get; set; } = null!;
}

using EduSapienxa.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSapienxa.Infrastructure.Configurations;

public class CourseSubcategoryConfiguration : IEntityTypeConfiguration<CourseSubcategory>
{
    public void Configure(EntityTypeBuilder<CourseSubcategory> builder)
    {
        builder.HasKey(cs => new { cs.CourseId, cs.SubcategoryId });

        builder.HasOne(cs => cs.Course)
            .WithMany(c => c.CourseSubcategories)
            .HasForeignKey(cs => cs.CourseId);

        builder.HasOne(cs => cs.Subcategory)
            .WithMany(s => s.CourseSubcategories)
            .HasForeignKey(cs => cs.SubcategoryId);
    }
}

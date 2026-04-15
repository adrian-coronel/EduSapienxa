using EduSapienxa.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSapienxa.Infrastructure.Configurations;

public class LeadInterestConfiguration : IEntityTypeConfiguration<LeadInterest>
{
    public void Configure(EntityTypeBuilder<LeadInterest> builder)
    {
        builder.HasKey(li => li.Id);

        builder.HasOne(li => li.Lead)
            .WithMany(l => l.Interests)
            .HasForeignKey(li => li.LeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(li => li.Course)
            .WithMany(c => c.LeadInterests)
            .HasForeignKey(li => li.CourseId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasOne(li => li.Subcategory)
            .WithMany()
            .HasForeignKey(li => li.SubcategoryId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasOne(li => li.Category)
            .WithMany()
            .HasForeignKey(li => li.CategoryId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);
    }
}

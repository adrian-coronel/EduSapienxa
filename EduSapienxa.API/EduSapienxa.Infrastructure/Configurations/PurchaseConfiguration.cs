using EduSapienxa.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSapienxa.Infrastructure.Configurations;

public class PurchaseConfiguration : IEntityTypeConfiguration<Purchase>
{
    public void Configure(EntityTypeBuilder<Purchase> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.AmountPaid).HasPrecision(18, 2);
        builder.Property(p => p.RegisteredById).IsRequired();
        builder.Property(p => p.Notes).HasMaxLength(1000);

        builder.HasOne(p => p.Lead)
            .WithMany(l => l.Purchases)
            .HasForeignKey(p => p.LeadId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Course)
            .WithMany(c => c.Purchases)
            .HasForeignKey(p => p.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.RegisteredBy)
            .WithMany(u => u.Purchases)
            .HasForeignKey(p => p.RegisteredById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

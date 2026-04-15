using EduSapienxa.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSapienxa.Infrastructure.Configurations;

public class LeadConfiguration : IEntityTypeConfiguration<Lead>
{
    public void Configure(EntityTypeBuilder<Lead> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Name).IsRequired().HasMaxLength(200);
        builder.Property(l => l.Email).HasMaxLength(200);
        builder.Property(l => l.WhatsAppId).HasMaxLength(50);
        builder.Property(l => l.Status).IsRequired().HasMaxLength(50).HasDefaultValue("new");
        builder.Property(l => l.Source).IsRequired().HasMaxLength(50).HasDefaultValue("manual");
        builder.Property(l => l.Notes).HasMaxLength(1000);

        builder.HasIndex(l => l.WhatsAppId).IsUnique().HasFilter("\"WhatsAppId\" IS NOT NULL");
        builder.HasIndex(l => l.Status);
        builder.HasIndex(l => l.Source);
    }
}

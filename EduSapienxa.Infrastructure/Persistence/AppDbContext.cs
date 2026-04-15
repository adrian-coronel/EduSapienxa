using EduSapienxa.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace EduSapienxa.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Subcategory> Subcategories => Set<Subcategory>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseSubcategory> CourseSubcategories => Set<CourseSubcategory>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<LeadInterest> LeadInterests => Set<LeadInterest>();
    public DbSet<Purchase> Purchases => Set<Purchase>();
    public DbSet<AppUser> AppUsers => Set<AppUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Metadata.FindProperty("CreatedAt") != null)
                    entry.Property("CreatedAt").CurrentValue = now;
                if (entry.Metadata.FindProperty("UpdatedAt") != null)
                    entry.Property("UpdatedAt").CurrentValue = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                if (entry.Metadata.FindProperty("UpdatedAt") != null)
                    entry.Property("UpdatedAt").CurrentValue = now;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}

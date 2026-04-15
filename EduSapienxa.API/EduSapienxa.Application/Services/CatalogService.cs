using EduSapienxa.Application.DTOs;
using EduSapienxa.Application.Interfaces;
using EduSapienxa.Domain.Entities;

namespace EduSapienxa.Application.Services;

public class CatalogService
{
    private readonly IRepository<Category> _categories;
    private readonly IRepository<Subcategory> _subcategories;
    private readonly ICourseRepository _courses;

    public CatalogService(
        IRepository<Category> categories,
        IRepository<Subcategory> subcategories,
        ICourseRepository courses)
    {
        _categories = categories;
        _subcategories = subcategories;
        _courses = courses;
    }

    // Categories
    public async Task<IEnumerable<CategoryResponse>> GetCategoriesAsync()
    {
        var categories = await _categories.GetAllAsync();
        return categories.Select(MapCategoryResponse).ToArray();
    }

    public async Task<CategoryWithSubsResponse?> GetCategoryAsync(int id)
    {
        var category = await _categories.GetByIdAsync(id);
        if (category is null) return null;

        var subcategories = await _subcategories.GetAllAsync();
        var categorySubcategories = subcategories
            .Where(s => s.CategoryId == id)
            .Select(MapSubcategoryResponse)
            .ToArray();

        return MapCategoryWithSubsResponse(category, categorySubcategories);
    }

    public async Task<CategoryResponse> CreateCategoryAsync(string name, string? description, bool? isActive = null)
    {
        var category = new Category { Name = name, Description = description, IsActive = isActive ?? true };
        await _categories.AddAsync(category);
        await _categories.SaveChangesAsync();
        return MapCategoryResponse(category);
    }

    public async Task<CategoryResponse?> UpdateCategoryAsync(int id, string name, string? description, bool? isActive = null)
    {
        var category = await _categories.GetByIdAsync(id);
        if (category is null) return null;
        category.Name = name;
        category.Description = description;
        category.IsActive = isActive ?? category.IsActive;
        _categories.Update(category);
        await _categories.SaveChangesAsync();
        return MapCategoryResponse(category);
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _categories.GetByIdAsync(id);
        if (category is null) return false;
        _categories.Delete(category);
        await _categories.SaveChangesAsync();
        return true;
    }

    // Subcategories
    public async Task<IEnumerable<SubcategoryResponse>> GetSubcategoriesAsync()
    {
        var subcategories = await _subcategories.GetAllAsync();
        return subcategories.Select(MapSubcategoryResponse).ToArray();
    }

    public async Task<SubcategoryResponse?> GetSubcategoryAsync(int id)
    {
        var subcategory = await _subcategories.GetByIdAsync(id);
        return subcategory is null ? null : MapSubcategoryResponse(subcategory);
    }

    public async Task<SubcategoryResponse> CreateSubcategoryAsync(string name, string? description, int categoryId, bool? isActive = null)
    {
        var subcategory = new Subcategory { Name = name, Description = description, CategoryId = categoryId, IsActive = isActive ?? true };
        await _subcategories.AddAsync(subcategory);
        await _subcategories.SaveChangesAsync();
        return MapSubcategoryResponse(subcategory);
    }

    public async Task<SubcategoryResponse?> UpdateSubcategoryAsync(int id, string name, string? description, int categoryId, bool? isActive = null)
    {
        var subcategory = await _subcategories.GetByIdAsync(id);
        if (subcategory is null) return null;
        subcategory.Name = name;
        subcategory.Description = description;
        subcategory.CategoryId = categoryId;
        subcategory.IsActive = isActive ?? subcategory.IsActive;
        _subcategories.Update(subcategory);
        await _subcategories.SaveChangesAsync();
        return MapSubcategoryResponse(subcategory);
    }

    public async Task<bool> DeleteSubcategoryAsync(int id)
    {
        var subcategory = await _subcategories.GetByIdAsync(id);
        if (subcategory is null) return false;
        _subcategories.Delete(subcategory);
        await _subcategories.SaveChangesAsync();
        return true;
    }

    // Courses
    public async Task<IEnumerable<CourseResponse>> GetCoursesAsync()
    {
        var courses = await _courses.GetAllAsync();
        return courses.Select(MapCourseResponse).ToArray();
    }

    public async Task<CourseWithSubsResponse?> GetCourseAsync(int id)
    {
        var course = await _courses.GetWithSubcategoriesAsync(id);
        if (course is null) return null;

        var subcategories = course.CourseSubcategories
            .Select(cs => MapSubcategoryResponse(cs.Subcategory))
            .GroupBy(s => s.Id)
            .Select(group => group.First())
            .ToArray();

        return MapCourseWithSubsResponse(course, subcategories);
    }

    public async Task<CourseResponse> CreateCourseAsync(string name, string? description, decimal price, string checkoutUrl, bool? isActive = null)
    {
        var course = new Course { Name = name, Description = description, Price = price, CheckoutUrl = checkoutUrl, IsActive = isActive ?? true };
        await _courses.AddAsync(course);
        await _courses.SaveChangesAsync();
        return MapCourseResponse(course);
    }

    public async Task<CourseResponse?> UpdateCourseAsync(int id, string name, string? description, decimal price, string checkoutUrl, bool? isActive = null)
    {
        var course = await _courses.GetByIdAsync(id);
        if (course is null) return null;
        course.Name = name;
        course.Description = description;
        course.Price = price;
        course.CheckoutUrl = checkoutUrl;
        course.IsActive = isActive ?? course.IsActive;
        _courses.Update(course);
        await _courses.SaveChangesAsync();
        return MapCourseResponse(course);
    }

    public async Task<bool> DeleteCourseAsync(int id)
    {
        var course = await _courses.GetByIdAsync(id);
        if (course is null) return false;
        _courses.Delete(course);
        await _courses.SaveChangesAsync();
        return true;
    }

    private static CategoryResponse MapCategoryResponse(Category category) =>
        new(
            category.Id,
            category.Name,
            category.Description,
            category.IsActive,
            category.CreatedAt,
            category.UpdatedAt);

    private static CategoryWithSubsResponse MapCategoryWithSubsResponse(Category category, SubcategoryResponse[] subcategories) =>
        new(
            category.Id,
            category.Name,
            category.Description,
            category.IsActive,
            category.CreatedAt,
            category.UpdatedAt,
            subcategories);

    private static SubcategoryResponse MapSubcategoryResponse(Subcategory subcategory) =>
        new(
            subcategory.Id,
            subcategory.Name,
            subcategory.Description,
            subcategory.IsActive,
            subcategory.CategoryId,
            subcategory.CreatedAt,
            subcategory.UpdatedAt);

    private static CourseResponse MapCourseResponse(Course course) =>
        new(
            course.Id,
            course.Name,
            course.Description,
            course.Price,
            course.CheckoutUrl,
            course.IsActive,
            course.CreatedAt,
            course.UpdatedAt);

    private static CourseWithSubsResponse MapCourseWithSubsResponse(Course course, SubcategoryResponse[] subcategories) =>
        new(
            course.Id,
            course.Name,
            course.Description,
            course.Price,
            course.CheckoutUrl,
            course.IsActive,
            course.CreatedAt,
            course.UpdatedAt,
            subcategories);
}

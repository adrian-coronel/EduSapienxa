using EduSapienxa.Application.DTOs;
using EduSapienxa.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSapienxa.API.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly CatalogService _catalog;

    public CategoriesController(CatalogService catalog) => _catalog = catalog;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetAll() =>
        Ok(await _catalog.GetCategoriesAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryWithSubsResponse>> GetById(int id)
    {
        var category = await _catalog.GetCategoryAsync(id);
        return category is null ? NotFound() : Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryResponse>> Create([FromBody] CreateCategoryRequest request)
    {
        var category = await _catalog.CreateCategoryAsync(request.Name, request.Description, request.IsActive);
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryResponse>> Update(int id, [FromBody] UpdateCategoryRequest request)
    {
        var category = await _catalog.UpdateCategoryAsync(id, request.Name, request.Description, request.IsActive);
        return category is null ? NotFound() : Ok(category);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _catalog.DeleteCategoryAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}

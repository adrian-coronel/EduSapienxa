using EduSapienxa.Application.DTOs;
using EduSapienxa.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSapienxa.API.Controllers;

[ApiController]
[Route("api/subcategories")]
[Authorize]
public class SubcategoriesController : ControllerBase
{
    private readonly CatalogService _catalog;

    public SubcategoriesController(CatalogService catalog) => _catalog = catalog;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SubcategoryResponse>>> GetAll() =>
        Ok(await _catalog.GetSubcategoriesAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<SubcategoryResponse>> GetById(int id)
    {
        var subcategory = await _catalog.GetSubcategoryAsync(id);
        return subcategory is null ? NotFound() : Ok(subcategory);
    }

    [HttpPost]
    public async Task<ActionResult<SubcategoryResponse>> Create([FromBody] CreateSubcategoryRequest request)
    {
        var subcategory = await _catalog.CreateSubcategoryAsync(request.Name, request.Description, request.CategoryId, request.IsActive);
        return CreatedAtAction(nameof(GetById), new { id = subcategory.Id }, subcategory);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SubcategoryResponse>> Update(int id, [FromBody] UpdateSubcategoryRequest request)
    {
        var subcategory = await _catalog.UpdateSubcategoryAsync(id, request.Name, request.Description, request.CategoryId, request.IsActive);
        return subcategory is null ? NotFound() : Ok(subcategory);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _catalog.DeleteSubcategoryAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}

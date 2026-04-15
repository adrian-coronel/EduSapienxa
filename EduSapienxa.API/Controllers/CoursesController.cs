using EduSapienxa.Application.DTOs;
using EduSapienxa.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSapienxa.API.Controllers;

[ApiController]
[Route("api/courses")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly CatalogService _catalog;

    public CoursesController(CatalogService catalog) => _catalog = catalog;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CourseResponse>>> GetAll() =>
        Ok(await _catalog.GetCoursesAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<CourseWithSubsResponse>> GetById(int id)
    {
        var course = await _catalog.GetCourseAsync(id);
        return course is null ? NotFound() : Ok(course);
    }

    [HttpPost]
    public async Task<ActionResult<CourseResponse>> Create([FromBody] CreateCourseRequest request)
    {
        var course = await _catalog.CreateCourseAsync(request.Name, request.Description, request.Price, request.CheckoutUrl, request.IsActive);
        return CreatedAtAction(nameof(GetById), new { id = course.Id }, course);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CourseResponse>> Update(int id, [FromBody] UpdateCourseRequest request)
    {
        var course = await _catalog.UpdateCourseAsync(id, request.Name, request.Description, request.Price, request.CheckoutUrl, request.IsActive);
        return course is null ? NotFound() : Ok(course);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _catalog.DeleteCourseAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}

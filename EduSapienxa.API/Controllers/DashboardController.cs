using EduSapienxa.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSapienxa.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboard;

    public DashboardController(DashboardService dashboard) => _dashboard = dashboard;

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary() => Ok(await _dashboard.GetSummaryAsync());

    [HttpGet("top-courses")]
    public async Task<IActionResult> GetTopCourses() => Ok(await _dashboard.GetTopCoursesAsync());
}

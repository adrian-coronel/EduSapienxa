using EduSapienxa.Application.DTOs;
using EduSapienxa.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSapienxa.API.Controllers;

[ApiController]
[Route("api/leads")]
[Authorize]
public class LeadsController : ControllerBase
{
    private readonly LeadService _leads;
    private readonly RecommendationService _recommendations;

    public LeadsController(LeadService leads, RecommendationService recommendations)
    {
        _leads = leads;
        _recommendations = recommendations;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeadResponse>>> GetAll([FromQuery] string? status)
    {
        var leads = string.IsNullOrEmpty(status)
            ? await _leads.GetLeadsAsync()
            : await _leads.GetLeadsByStatusAsync(status);
        return Ok(leads);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var lead = await _leads.GetLeadAsync(id);
        return lead is null ? NotFound() : Ok(lead);
    }

    [HttpPost]
    public async Task<ActionResult<LeadResponse>> Create([FromBody] CreateLeadRequest request)
    {
        var lead = await _leads.CreateLeadAsync(request.Name, request.Email, request.WhatsAppId, request.Source, request.Notes);
        return CreatedAtAction(nameof(GetById), new { id = lead.Id }, lead);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<LeadResponse>> Update(int id, [FromBody] UpdateLeadRequest request)
    {
        var lead = await _leads.UpdateLeadAsync(id, request.Name, request.Email, request.WhatsAppId, request.Status, request.Notes);
        return lead is null ? NotFound() : Ok(lead);
    }

    [HttpPost("{id}/interests")]
    public async Task<IActionResult> AddInterest(int id, [FromBody] AddInterestRequest request)
    {
        var interest = await _leads.AddInterestAsync(id, request.CourseId, request.SubcategoryId, request.CategoryId);
        return interest is null ? NotFound() : Ok(interest);
    }

    [HttpGet("{id}/recommendations")]
    public async Task<IActionResult> GetRecommendations(int id) =>
        Ok(await _recommendations.GetRecommendationsForLeadAsync(id));
}

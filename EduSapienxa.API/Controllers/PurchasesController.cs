using EduSapienxa.Application.DTOs;
using EduSapienxa.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduSapienxa.API.Controllers;

[ApiController]
[Authorize]
public class PurchasesController : ControllerBase
{
    private readonly PurchaseService _purchases;

    public PurchasesController(PurchaseService purchases) => _purchases = purchases;

    [HttpGet("api/purchases")]
    public async Task<ActionResult<IEnumerable<PurchaseResponse>>> GetAll() =>
        Ok(await _purchases.GetAllPurchasesAsync());

    [HttpGet("api/leads/{id}/purchases")]
    public async Task<ActionResult<IEnumerable<PurchaseResponse>>> GetByLead(int id) =>
        Ok(await _purchases.GetPurchasesByLeadAsync(id));

    [HttpPost("api/purchases")]
    public async Task<ActionResult<PurchaseResponse>> Create([FromBody] CreatePurchaseRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("User not authenticated.");

        var purchase = await _purchases.RegisterPurchaseAsync(
            request.LeadId, request.CourseId, request.AmountPaid, userId, request.Notes);

        return Ok(purchase);
    }
}

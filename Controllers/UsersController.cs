using EduSapienxa.Application.DTOs;
using EduSapienxa.Application.Interfaces;
using EduSapienxa.Application.Services;
using EduSapienxa.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSapienxa.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "admin")]
public class UsersController : ControllerBase
{
    private readonly AuthService _auth;
    private readonly IRepository<AppUser> _users;

    public UsersController(AuthService auth, IRepository<AppUser> users)
    {
        _auth = auth;
        _users = users;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppUserResponse>>> GetAll()
    {
        var users = await _users.GetAllAsync();
        return Ok(users.Select(MapAppUserResponse));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        var user = await _auth.CreateUserAsync(request.Name, request.Email, request.Password, request.Role);
        return Ok(new { user.Id, user.Name, user.Email, user.Role });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserRequest request)
    {
        var users = await _users.GetAllAsync();
        var user = users.FirstOrDefault(u => u.Id == id);
        if (user is null) return NotFound();

        user.Name = request.Name;
        user.Email = request.Email;
        user.Role = request.Role;
        _users.Update(user);
        await _users.SaveChangesAsync();
        return Ok(new { user.Id, user.Name, user.Email, user.Role });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deactivate(string id)
    {
        var users = await _users.GetAllAsync();
        var user = users.FirstOrDefault(u => u.Id == id);
        if (user is null) return NotFound();

        user.IsActive = false;
        _users.Update(user);
        await _users.SaveChangesAsync();
        return NoContent();
    }

    private static AppUserResponse MapAppUserResponse(AppUser user) =>
        new(
            user.Id,
            user.Name,
            user.Email,
            user.Role,
            user.IsActive,
            user.CreatedAt,
            user.UpdatedAt);
}

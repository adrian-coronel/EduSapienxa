using EduSapienxa.Application.Interfaces;
using EduSapienxa.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EduSapienxa.Application.Services;

public class AuthService
{
    private readonly IRepository<AppUser> _users;
    private readonly IConfiguration _config;

    public AuthService(IRepository<AppUser> users, IConfiguration config)
    {
        _users = users;
        _config = config;
    }

    public async Task<string?> LoginAsync(string email, string password)
    {
        var users = await _users.GetAllAsync();
        var user = users.FirstOrDefault(u => u.Email == email && u.IsActive);
        if (user is null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return null;

        return GenerateToken(user);
    }

    public async Task<AppUser> CreateUserAsync(string name, string email, string password, string role)
    {
        var user = new AppUser
        {
            Name = name,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = role
        };
        await _users.AddAsync(user);
        await _users.SaveChangesAsync();
        return user;
    }

    private string GenerateToken(AppUser user)
    {
        var key = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured.");
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

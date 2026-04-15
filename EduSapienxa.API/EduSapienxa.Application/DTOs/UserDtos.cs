namespace EduSapienxa.Application.DTOs;

public record CreateUserRequest(string Name, string Email, string Password, string Role = "editor");
public record UpdateUserRequest(string Name, string Email, string Role);

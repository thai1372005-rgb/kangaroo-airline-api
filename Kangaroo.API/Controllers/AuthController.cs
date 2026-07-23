using System.Linq;
using Kangaroo.API.Data;
using Kangaroo.API.DTOs;
using Kangaroo.API.Models;
using Kangaroo.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Kangaroo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly AuthService _auth;
        private readonly ILogger<AuthController> _logger;

        public AuthController(AppDbContext db, AuthService auth, ILogger<AuthController> logger)
        {
            _db = db;
            _auth = auth;
            _logger = logger;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] UserCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Normalize email
            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

            // Check for existing email
            if (_db.Users.Any(u => u.Email.ToLower() == normalizedEmail))
            {
                return BadRequest(new { detail = "This email is already registered." });
            }

            // Validate password strength
            if (!_auth.ValidatePasswordStrength(dto.Password))
            {
                return BadRequest(new { detail = "Password must contain at least one uppercase letter, one number, and one special character." });
            }

            try
            {
                var user = new User
                {
                    Username = dto.Username.Trim(),
                    Email = normalizedEmail,
                    HashedPassword = _auth.HashPassword(dto.Password),
                    CreatedAt = System.DateTime.UtcNow
                };

                _db.Users.Add(user);
                _db.SaveChanges();

                var result = new UserOutDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role,
                    CreatedAt = user.CreatedAt
                };

                _logger.LogInformation($"User registered: {user.Email}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return StatusCode(500, new { detail = "An error occurred during registration." });
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] UserCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
                var user = _db.Users.FirstOrDefault(u => u.Email.ToLower() == normalizedEmail);

                if (user == null || !_auth.VerifyPassword(dto.Password, user.HashedPassword))
                {
                    _logger.LogWarning($"Failed login attempt for email: {normalizedEmail}");
                    // Return generic message to prevent email enumeration
                    return Unauthorized(new { detail = "Invalid email or password." });
                }

                var token = _auth.CreateToken(user.Username, user.Role);
                _logger.LogInformation($"User logged in: {user.Email}");
                return Ok(new TokenDto { Access_Token = token, Token_Type = "bearer" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, new { detail = "An error occurred during login." });
            }
        }
    }
}

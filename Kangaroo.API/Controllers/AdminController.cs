using System;
using System.Linq;
using Kangaroo.API.Data;
using Kangaroo.API.DTOs;
using Kangaroo.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kangaroo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AdminController(AppDbContext db)
        {
            _db = db;
        }

        private bool IsAdmin()
        {
            var role = User?.Claims?.FirstOrDefault(c => c.Type == "role")?.Value;
            return string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
        }

        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            if (!IsAdmin()) return Forbid();

            var users = _db.Users
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserOutDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt
                })
                .ToList();

            return Ok(users);
        }

        public class UserUpdateAdminDto
        {
            [System.Text.Json.Serialization.JsonPropertyName("username")]
            public string Username { get; set; }

            [System.Text.Json.Serialization.JsonPropertyName("email")]
            public string Email { get; set; }

            [System.Text.Json.Serialization.JsonPropertyName("role")]
            public string Role { get; set; }
        }

        [HttpPut("users/{id:int}")]
        public IActionResult UpdateUser([FromRoute] int id, [FromBody] UserUpdateAdminDto dto)
        {
            if (!IsAdmin()) return Forbid();

            var user = _db.Users.SingleOrDefault(u => u.Id == id);
            if (user == null) return NotFound(new { detail = "User không tồn tại" });

            if (!string.IsNullOrWhiteSpace(dto.Username))
                user.Username = dto.Username.Trim();

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var normalized = dto.Email.Trim();
                var emailTaken = _db.Users.Any(u => u.Email == normalized && u.Id != id);
                if (emailTaken)
                    return BadRequest(new { detail = "Email này đã tồn tại" });

                user.Email = normalized;
            }

            if (!string.IsNullOrWhiteSpace(dto.Role))
            {
                var newRole = dto.Role.Trim().ToLowerInvariant();
                if (newRole != "admin" && newRole != "user")
                    return BadRequest(new { detail = "Role không hợp lệ (chỉ cho phép admin/user)" });

                user.Role = newRole;
            }

            _db.SaveChanges();

            return Ok(new UserOutDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            });
        }

        public class FlightUpdateAdminDto
        {
            [System.Text.Json.Serialization.JsonPropertyName("flight_number")]
            public string Flight_Number { get; set; }

            [System.Text.Json.Serialization.JsonPropertyName("departure_airport_id")]
            public int Departure_Airport_Id { get; set; }

            [System.Text.Json.Serialization.JsonPropertyName("arrival_airport_id")]
            public int Arrival_Airport_Id { get; set; }

            [System.Text.Json.Serialization.JsonPropertyName("departure_time")]
            public DateTime Departure_Time { get; set; }

            [System.Text.Json.Serialization.JsonPropertyName("arrival_time")]
            public DateTime Arrival_Time { get; set; }

            [System.Text.Json.Serialization.JsonPropertyName("price")]
            public decimal Price { get; set; }

            [System.Text.Json.Serialization.JsonPropertyName("total_seats")]
            public int Total_Seats { get; set; }
        }

        [HttpPut("flights/{id:int}")]
        public IActionResult UpdateFlight([FromRoute] int id, [FromBody] FlightUpdateAdminDto dto)
        {
            if (!IsAdmin()) return Forbid();

            var flight = _db.Flights
                .Include(f => f.DepartureAirport)
                .Include(f => f.ArrivalAirport)
                .SingleOrDefault(f => f.Id == id);

            if (flight == null) return NotFound(new { detail = "Flight không tồn tại" });

            if (string.IsNullOrWhiteSpace(dto.Flight_Number)) return BadRequest(new { detail = "flight_number là bắt buộc" });
            if (dto.Total_Seats <= 0) return BadRequest(new { detail = "total_seats phải > 0" });
            if (dto.Arrival_Time <= dto.Departure_Time) return BadRequest(new { detail = "arrival_time phải sau departure_time" });
            if (dto.Price < 0) return BadRequest(new { detail = "price không hợp lệ" });

            flight.FlightNumber = dto.Flight_Number.Trim();
            flight.DepartureAirportId = dto.Departure_Airport_Id;
            flight.ArrivalAirportId = dto.Arrival_Airport_Id;
            flight.DepartureTime = dto.Departure_Time;
            flight.ArrivalTime = dto.Arrival_Time;
            flight.Price = dto.Price;
            flight.TotalSeats = dto.Total_Seats;

            _db.SaveChanges();

            var outDto = new FlightOutDto
            {
                Id = flight.Id,
                Flight_Number = flight.FlightNumber,
                Departure_Airport_Id = flight.DepartureAirportId ?? 0,
                Arrival_Airport_Id = flight.ArrivalAirportId ?? 0,
                Departure_Time = flight.DepartureTime,
                Arrival_Time = flight.ArrivalTime,
                Price = flight.Price,
                Total_Seats = flight.TotalSeats,
                Departure_Airport = new AirportOutDto
                {
                    Id = flight.DepartureAirport?.Id ?? 0,
                    Code = flight.DepartureAirport?.Code,
                    Name = flight.DepartureAirport?.Name,
                    City = flight.DepartureAirport?.City
                },
                Arrival_Airport = new AirportOutDto
                {
                    Id = flight.ArrivalAirport?.Id ?? 0,
                    Code = flight.ArrivalAirport?.Code,
                    Name = flight.ArrivalAirport?.Name,
                    City = flight.ArrivalAirport?.City
                }
            };

            return Ok(outDto);
        }

        [HttpDelete("flights/{id:int}")]
        public IActionResult DeleteFlight([FromRoute] int id)
        {
            if (!IsAdmin()) return Forbid();

            var flight = _db.Flights.SingleOrDefault(f => f.Id == id);
            if (flight == null) return NotFound(new { detail = "Flight không tồn tại" });

            var hasBookings = _db.Bookings.Any(b => b.FlightId == id);
            if (hasBookings)
                return BadRequest(new { detail = "Không thể xóa chuyến bay đã có người đặt vé" });

            _db.Flights.Remove(flight);
            _db.SaveChanges();
            return Ok(new { detail = "Xóa chuyến bay thành công" });
        }

        [HttpDelete("users/{id:int}")]
        public IActionResult DeleteUser([FromRoute] int id)
        {
            if (!IsAdmin()) return Forbid();

            // Prevent self-delete
            var currentUserId = User?.Claims?.FirstOrDefault(c => c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            if (currentUserId == id.ToString())
                return BadRequest(new { detail = "Không thể xóa chính mình" });

            var targetUser = _db.Users.SingleOrDefault(u => u.Id == id);
            if (targetUser == null) return NotFound(new { detail = "User không tồn tại" });

            _db.Users.Remove(targetUser);
            _db.SaveChanges();
            return Ok(new { detail = "Xóa user thành công" });
        }

        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            if (!IsAdmin()) return Forbid();

            return Ok(new
            {
                totalUsers = _db.Users.Count(),
                totalFlights = _db.Flights.Count(),
                totalBookings = _db.Bookings.Count()
            });
        }
    }
}

using System;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Kangaroo.API.Data;
using Kangaroo.API.DTOs;
using Kangaroo.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Kangaroo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ILogger<BookingsController> _logger;

        public BookingsController(AppDbContext db, ILogger<BookingsController> logger)
        {
            _db = db;
            _logger = logger;
        }

        private User GetCurrentUser()
        {
            var username = User?.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return null;

            return _db.Users.FirstOrDefault(u => u.Username == username);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] BookingCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = GetCurrentUser();
            if (user == null)
            {
                return Unauthorized(new { detail = "User not found." });
            }

            try
            {
                var flight = await _db.Flights
                    .Include(f => f.DepartureAirport)
                    .Include(f => f.ArrivalAirport)
                    .FirstOrDefaultAsync(f => f.Id == dto.Flight_Id);

                if (flight == null)
                {
                    return NotFound(new { detail = "Flight not found." });
                }

                // Verify flight hasn't departed
                if (flight.DepartureTime < DateTime.UtcNow)
                {
                    return BadRequest(new { detail = "Cannot book a flight that has already departed." });
                }

                using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
                try
                {
                    // Check for duplicate seat (thread-safe)
                    var existingBooking = await _db.Bookings
                        .FirstOrDefaultAsync(b => b.FlightId == dto.Flight_Id && b.SeatNumber == dto.Seat_Number);

                    if (existingBooking != null)
                    {
                        await transaction.RollbackAsync();
                        return Conflict(new { detail = "This seat has already been booked." });
                    }

                    var booking = new Booking
                    {
                        UserId = user.Id,
                        FlightId = dto.Flight_Id,
                        SeatNumber = dto.Seat_Number,
                        Status = "confirmed",
                        BookingDate = DateTime.UtcNow
                    };

                    _db.Bookings.Add(booking);
                    await _db.SaveChangesAsync();
                    await transaction.CommitAsync();

                    _logger.LogInformation($"Booking created: User {user.Id}, Flight {flight.Id}, Seat {dto.Seat_Number}");
                    return CreatedAtAction(nameof(GetBookingById), new { id = booking.Id }, MapBookingToDto(booking, flight));
                }
                catch (DbUpdateException ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Database error during booking creation");
                    return Conflict(new { detail = "Booking could not be completed. Please try again." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error creating booking");
                return StatusCode(500, new { detail = "An unexpected error occurred." });
            }
        }

        [Authorize]
        [HttpGet("my-bookings")]
        public IActionResult GetMyBookings()
        {
            try
            {
                var user = GetCurrentUser();
                if (user == null)
                {
                    return Unauthorized(new { detail = "User not found." });
                }

                var bookings = _db.Bookings
                    .Where(b => b.UserId == user.Id)
                    .Include(b => b.Flight)
                    .ThenInclude(f => f.DepartureAirport)
                    .Include(b => b.Flight)
                    .ThenInclude(f => f.ArrivalAirport)
                    .AsNoTracking()
                    .ToList();

                var result = bookings
                    .Select(b => MapBookingToDto(b, b.Flight))
                    .ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user bookings");
                return StatusCode(500, new { detail = "An error occurred while retrieving bookings." });
            }
        }

        [Authorize]
        [HttpGet("{id}")]
        public IActionResult GetBookingById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { detail = "Valid booking ID is required." });
            }

            try
            {
                var user = GetCurrentUser();
                if (user == null)
                {
                    return Unauthorized(new { detail = "User not found." });
                }

                var booking = _db.Bookings
                    .Include(b => b.Flight)
                    .ThenInclude(f => f.DepartureAirport)
                    .Include(b => b.Flight)
                    .ThenInclude(f => f.ArrivalAirport)
                    .AsNoTracking()
                    .FirstOrDefault(b => b.Id == id);

                if (booking == null)
                {
                    return NotFound(new { detail = "Booking not found." });
                }

                // Check authorization: user can view own bookings, admins can view any
                if (booking.UserId != user.Id && user.Role != "admin")
                {
                    _logger.LogWarning($"Unauthorized access attempt to booking {id} by user {user.Id}");
                    return Forbid();
                }

                return Ok(MapBookingToDto(booking, booking.Flight));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving booking");
                return StatusCode(500, new { detail = "An error occurred while retrieving the booking." });
            }
        }

        private BookingOutDto MapBookingToDto(Booking booking, Flight flight)
        {
            return new BookingOutDto
            {
                Id = booking.Id,
                Booking_Date = booking.BookingDate,
                Status = booking.Status,
                Seat_Number = booking.SeatNumber,
                Flight = new FlightOutDto
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
                }
            };
        }
    }
}

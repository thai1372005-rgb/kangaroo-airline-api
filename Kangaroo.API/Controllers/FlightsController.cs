using System;
using System.Linq;
using Kangaroo.API.Data;
using Kangaroo.API.DTOs;
using Kangaroo.API.Models;
using Kangaroo.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Kangaroo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlightsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly PricingService _pricingService;
        private readonly ILogger<FlightsController> _logger;

        public FlightsController(AppDbContext db, PricingService pricingService, ILogger<FlightsController> logger)
        {
            _db = db;
            _pricingService = pricingService;
            _logger = logger;
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public IActionResult CreateFlight([FromBody] FlightCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (dto.Departure_Time >= dto.Arrival_Time)
            {
                return BadRequest(new { detail = "Departure time must be before arrival time." });
            }

            if (dto.Price <= 0)
            {
                return BadRequest(new { detail = "Price must be greater than zero." });
            }

            if (dto.Total_Seats <= 0)
            {
                return BadRequest(new { detail = "Total seats must be greater than zero." });
            }

            // Verify airports exist
            var depAirport = _db.Airports.FirstOrDefault(a => a.Id == dto.Departure_Airport_Id);
            var arrAirport = _db.Airports.FirstOrDefault(a => a.Id == dto.Arrival_Airport_Id);

            if (depAirport == null || arrAirport == null)
            {
                return BadRequest(new { detail = "Invalid departure or arrival airport." });
            }

            try
            {
                var f = new Flight
                {
                    FlightNumber = dto.Flight_Number.Trim(),
                    DepartureAirportId = dto.Departure_Airport_Id,
                    ArrivalAirportId = dto.Arrival_Airport_Id,
                    DepartureTime = dto.Departure_Time,
                    ArrivalTime = dto.Arrival_Time,
                    Price = dto.Price,
                    TotalSeats = dto.Total_Seats
                };

                _db.Flights.Add(f);
                _db.SaveChanges();
                _db.Entry(f).Reference(x => x.DepartureAirport).Load();
                _db.Entry(f).Reference(x => x.ArrivalAirport).Load();

                _logger.LogInformation($"Flight created: {f.FlightNumber}");
                return Ok(MapFlightToDto(f));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating flight");
                return StatusCode(500, new { detail = "An error occurred while creating the flight." });
            }
        }

        [HttpGet]
        public IActionResult GetFlights()
        {
            try
            {
                var flights = _db.Flights
                    .Include(f => f.DepartureAirport)
                    .Include(f => f.ArrivalAirport)
                    .AsNoTracking()
                    .ToList();

                var result = flights.Select(f => MapFlightToDto(f)).ToList();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flights");
                return StatusCode(500, new { detail = "An error occurred while retrieving flights." });
            }
        }

        [HttpGet("search")]
        public IActionResult SearchFlights(
            [FromQuery(Name = "dep_id")] int dep_id,
            [FromQuery(Name = "arr_id")] int arr_id,
            [FromQuery(Name = "flight_date")] string flight_date)
        {
            if (dep_id <= 0 || arr_id <= 0)
            {
                return BadRequest(new { detail = "Valid departure and arrival airport IDs are required." });
            }

            try
            {
                var query = _db.Flights
                    .Where(f => f.DepartureAirportId == dep_id && f.ArrivalAirportId == arr_id);

                if (!string.IsNullOrEmpty(flight_date))
                {
                    if (DateTime.TryParse(flight_date, out var dt))
                    {
                        query = query.Where(f => f.DepartureTime.Date == dt.Date);
                    }
                }

                var flights = query
                    .Include(f => f.DepartureAirport)
                    .Include(f => f.ArrivalAirport)
                    .AsNoTracking()
                    .ToList();

                // Calculate dynamic prices without mutating the original Flight objects
                var result = flights.Select(f => 
                {
                    var dto = MapFlightToDto(f);
                    dto.Price = _pricingService.CalculateDynamicPrice(f.Price, f.DepartureTime, f.TotalSeats);
                    return dto;
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching flights");
                return StatusCode(500, new { detail = "An error occurred while searching flights." });
            }
        }

        private FlightOutDto MapFlightToDto(Flight f)
        {
            return new FlightOutDto
            {
                Id = f.Id,
                Flight_Number = f.FlightNumber,
                Departure_Airport_Id = f.DepartureAirportId ?? 0,
                Arrival_Airport_Id = f.ArrivalAirportId ?? 0,
                Departure_Time = f.DepartureTime,
                Arrival_Time = f.ArrivalTime,
                Price = f.Price,
                Total_Seats = f.TotalSeats,
                Departure_Airport = new AirportOutDto
                {
                    Id = f.DepartureAirport?.Id ?? 0,
                    Code = f.DepartureAirport?.Code,
                    Name = f.DepartureAirport?.Name,
                    City = f.DepartureAirport?.City
                },
                Arrival_Airport = new AirportOutDto
                {
                    Id = f.ArrivalAirport?.Id ?? 0,
                    Code = f.ArrivalAirport?.Code,
                    Name = f.ArrivalAirport?.Name,
                    City = f.ArrivalAirport?.City
                }
            };
        }
    }
}

using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
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
    public class AirportsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ILogger<AirportsController> _logger;

        public AirportsController(AppDbContext db, ILogger<AirportsController> logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public IActionResult CreateAirport([FromBody] AirportCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existing = _db.Airports.FirstOrDefault(a => a.Code == dto.Code);
                if (existing != null)
                {
                    return BadRequest(new { detail = "Airport with this code already exists." });
                }

                var airport = new Airport
                {
                    Code = dto.Code.Trim().ToUpperInvariant(),
                    Name = dto.Name.Trim(),
                    City = dto.City.Trim()
                };

                _db.Airports.Add(airport);
                _db.SaveChanges();

                _logger.LogInformation($"Airport created: {airport.Code}");
                return CreatedAtAction(nameof(GetAirports), new { id = airport.Id }, 
                    new AirportOutDto { Id = airport.Id, Code = airport.Code, Name = airport.Name, City = airport.City });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating airport");
                return StatusCode(500, new { detail = "An error occurred while creating the airport." });
            }
        }

        [HttpGet]
        public IActionResult GetAirports()
        {
            try
            {
                var airports = _db.Airports
                    .AsNoTracking()
                    .OrderBy(a => a.City)
                    .Select(a => new AirportOutDto { Id = a.Id, Code = a.Code, Name = a.Name, City = a.City })
                    .ToList();

                return Ok(airports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving airports");
                return StatusCode(500, new { detail = "An error occurred while retrieving airports." });
            }
        }
    }
}

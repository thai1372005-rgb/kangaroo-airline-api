using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Kangaroo.API.DTOs
{
    public class FlightCreateDto
    {
        [JsonPropertyName("flight_number")]
        [Required(ErrorMessage = "Flight number is required")]
        [StringLength(20, MinimumLength = 2, ErrorMessage = "Flight number must be between 2 and 20 characters")]
        [RegularExpression(@"^[A-Z0-9]+$", ErrorMessage = "Flight number must contain only uppercase letters and numbers")]
        public string Flight_Number { get; set; }

        [JsonPropertyName("departure_airport_id")]
        [Range(1, int.MaxValue, ErrorMessage = "Valid departure airport ID is required")]
        public int Departure_Airport_Id { get; set; }

        [JsonPropertyName("arrival_airport_id")]
        [Range(1, int.MaxValue, ErrorMessage = "Valid arrival airport ID is required")]
        public int Arrival_Airport_Id { get; set; }

        [JsonPropertyName("departure_time")]
        public DateTime Departure_Time { get; set; }

        [JsonPropertyName("arrival_time")]
        public DateTime Arrival_Time { get; set; }

        [JsonPropertyName("price")]
        [Range(0.01, (double)decimal.MaxValue, ErrorMessage = "Price must be greater than zero")]
        public decimal Price { get; set; }

        [JsonPropertyName("total_seats")]
        [Range(1, 500, ErrorMessage = "Total seats must be between 1 and 500")]
        public int Total_Seats { get; set; }
    }

    public class FlightOutDto : FlightCreateDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("departure_airport")]
        public AirportOutDto Departure_Airport { get; set; }

        [JsonPropertyName("arrival_airport")]
        public AirportOutDto Arrival_Airport { get; set; }
    }
}

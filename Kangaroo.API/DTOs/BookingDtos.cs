using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Kangaroo.API.DTOs
{
    public class BookingCreateDto
    {
        [JsonPropertyName("flight_id")]
        [Range(1, int.MaxValue, ErrorMessage = "Valid Flight ID is required")]
        public int Flight_Id { get; set; }

        [JsonPropertyName("seat_number")]
        [Required(ErrorMessage = "Seat number is required")]
        [RegularExpression(@"^[A-Z]{1,2}\d{1,3}$", ErrorMessage = "Invalid seat number format (e.g., 12A, 1C)")]
        [StringLength(10, MinimumLength = 2, ErrorMessage = "Seat number must be between 2 and 10 characters")]
        public string Seat_Number { get; set; }
    }

    public class BookingOutDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("booking_date")]
        public DateTime Booking_Date { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; }

        [JsonPropertyName("seat_number")]
        public string Seat_Number { get; set; }

        [JsonPropertyName("flight")]
        public FlightOutDto Flight { get; set; }
    }
}

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kangaroo.API.Models
{
    [Table("flights")]
    public class Flight
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("flight_number")]
        [MaxLength(20)]
        public string FlightNumber { get; set; }

        [Column("departure_airport_id")]
        public int? DepartureAirportId { get; set; }

        [Column("arrival_airport_id")]
        public int? ArrivalAirportId { get; set; }

        [Required]
        [Column("departure_time")]
        public DateTime DepartureTime { get; set; }

        [Required]
        [Column("arrival_time")]
        public DateTime ArrivalTime { get; set; }

        [Required]
        [Column("price", TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [Required]
        [Column("total_seats")]
        public int TotalSeats { get; set; }

        [ForeignKey("DepartureAirportId")]
        public Airport DepartureAirport { get; set; }

        [ForeignKey("ArrivalAirportId")]
        public Airport ArrivalAirport { get; set; }
    }
}

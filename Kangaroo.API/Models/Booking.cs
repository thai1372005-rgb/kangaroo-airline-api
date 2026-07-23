using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kangaroo.API.Models
{
    [Table("bookings")]
    public class Booking
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("flight_id")]
        public int FlightId { get; set; }

        [Column("booking_date")]
        public DateTime BookingDate { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; }

        [Column("seat_number")]
        [MaxLength(10)]
        public string SeatNumber { get; set; }

        [ForeignKey("UserId")]
        public User Passenger { get; set; }

        [ForeignKey("FlightId")]
        public Flight Flight { get; set; }
    }
}

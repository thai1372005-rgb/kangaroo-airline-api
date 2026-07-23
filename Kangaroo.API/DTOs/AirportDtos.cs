using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Kangaroo.API.DTOs
{
    public class AirportCreateDto
    {
        [JsonPropertyName("code")]
        [Required(ErrorMessage = "Airport code is required")]
        [StringLength(5, MinimumLength = 2, ErrorMessage = "Airport code must be between 2 and 5 characters")]
        [RegularExpression(@"^[A-Z]+$", ErrorMessage = "Airport code must contain only uppercase letters")]
        public string Code { get; set; }

        [JsonPropertyName("name")]
        [Required(ErrorMessage = "Airport name is required")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Airport name must be between 3 and 100 characters")]
        public string Name { get; set; }

        [JsonPropertyName("city")]
        [Required(ErrorMessage = "City is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "City must be between 2 and 100 characters")]
        public string City { get; set; }
    }

    public class AirportOutDto : AirportCreateDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
    }
}

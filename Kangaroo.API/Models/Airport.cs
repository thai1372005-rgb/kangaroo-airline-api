using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kangaroo.API.Models
{
    [Table("airports")]
    public class Airport
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("code")]
        [MaxLength(10)]
        public string Code { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [Column("city")]
        [MaxLength(100)]
        public string City { get; set; }
    }
}

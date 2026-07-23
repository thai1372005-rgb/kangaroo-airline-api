using Kangaroo.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Kangaroo.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Airport> Airports { get; set; }
        public DbSet<Flight> Flights { get; set; }
        public DbSet<Booking> Bookings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Ensure table names and column types match Python models where necessary
            modelBuilder.Entity<Flight>().Property(f => f.Price).HasColumnType("decimal(10,2)");
        }
    }
}

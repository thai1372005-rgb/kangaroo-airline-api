using System;

namespace Kangaroo.API.Services
{
    public class PricingService
    {
        /// <summary>
        /// Calculate dynamic flight price based on days until departure and seat availability
        /// </summary>
        public decimal CalculateDynamicPrice(decimal basePrice, DateTime departureTime, int totalSeats)
        {
            if (basePrice <= 0)
                throw new ArgumentException("Base price must be greater than zero", nameof(basePrice));

            var now = DateTime.Now;
            var daysUntilFlight = (departureTime - now).Days;

            // Time-based multiplier: increases price as departure approaches
            var timeMultiplier = 1.0m;
            if (daysUntilFlight < 3)
            {
                timeMultiplier = 1.5m;
            }
            else if (daysUntilFlight < 7)
            {
                timeMultiplier = 1.2m;
            }

            // Demand-based multiplier: increases price for smaller aircraft
            var demandMultiplier = totalSeats < 50 ? 1.1m : 1.0m;

            var dynamicPrice = basePrice * timeMultiplier * demandMultiplier;

            // Cap the price to prevent excessive increases
            var maxPrice = basePrice * 2.0m;
            return Math.Min(dynamicPrice, maxPrice);
        }
    }
}

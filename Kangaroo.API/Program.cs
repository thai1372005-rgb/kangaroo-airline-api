using System.Text;
using Kangaroo.API.Data;
using Kangaroo.API.Services;
using Kangaroo.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers().AddJsonOptions(opts => {
    // Keep default naming; DTOs already specify property names to match frontend
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

 // DbContext
var conn = builder.Configuration.GetConnectionString("DefaultConnection") ?? string.Empty;

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var trimmed = conn.Trim();

    // Detect SQLite connection string
    // Accept cases like: "Data Source=/app/test.db" (or with extra fields)
    var isSqlite = trimmed.IndexOf("Data Source=", StringComparison.OrdinalIgnoreCase) >= 0;

    if (isSqlite)
    {
        // Extract value after "Data Source="
        var marker = "Data Source=";
        var start = trimmed.IndexOf(marker, StringComparison.OrdinalIgnoreCase) + marker.Length;

        // Take until end (we expect only path; if extra params exist, it still won't break badly)
        var cs = trimmed.Substring(start).Trim();

        // EF Core expects a full sqlite connection string like "Data Source=/path/db.sqlite"
        // If we only extracted the path, restore the key.
        var sqliteConnString = cs.StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase)
            ? cs
            : $"Data Source={cs}";

        // If the path looks like the container path (/app/test.db), rewrite for local dev on Windows.
        // This prevents: SQLite Error 14: unable to open database file.
        if (sqliteConnString.IndexOf("Data Source=/app/", StringComparison.OrdinalIgnoreCase) >= 0)
        {
            sqliteConnString = "Data Source=./test.db";
        }

        options.UseSqlite(sqliteConnString);
    }
    else
    {
        // MySQL
        options.UseMySql(trimmed, ServerVersion.AutoDetect(trimmed));
    }
});

// AuthService
builder.Services.AddSingleton<AuthService>();
builder.Services.AddSingleton<PricingService>();

// JWT Authentication
var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "ReplaceWithStrongSecretKeyForJWT");
builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        NameClaimType = JwtRegisteredClaimNames.Sub
    };
});

        // CORS - Read allowed origins from config (appsettings.json / appsettings.Production.json)
        var corsOrigins = builder.Configuration["Cors:AllowedOrigins"]?
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            ?? new[] { "http://localhost:3000", "http://localhost:5173" };

        builder.Services.AddCors(options => {
            options.AddDefaultPolicy(policy => policy
                .WithOrigins(corsOrigins)
                .AllowAnyHeader()
                .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .AllowCredentials());
        });

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Seed admin user + ensure DB exists
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var auth = scope.ServiceProvider.GetRequiredService<AuthService>();

    db.Database.EnsureCreated();

    // Seed airports
    if (!db.Airports.Any())
    {
        var airports = new List<Airport>
        {
            new Airport { Code = "SGN", Name = "Tan Son Nhat International", City = "Ho Chi Minh City" },
            new Airport { Code = "HAN", Name = "Noi Bai International", City = "Hanoi" },
            new Airport { Code = "DAD", Name = "Da Nang International", City = "Da Nang" },
            new Airport { Code = "PQC", Name = "Phu Quoc International", City = "Phu Quoc" },
            new Airport { Code = "CTS", Name = "Can Tho International", City = "Can Tho" },
            new Airport { Code = "DLI", Name = "Lien Khuong", City = "Da Lat" }
        };
        db.Airports.AddRange(airports);
        db.SaveChanges();
    }

    // Seed flights
    if (!db.Flights.Any())
    {
        var airports = db.Airports.ToList();
        var sgn = airports.FirstOrDefault(a => a.Code == "SGN");
        var han = airports.FirstOrDefault(a => a.Code == "HAN");
        var dad = airports.FirstOrDefault(a => a.Code == "DAD");
        var pqc = airports.FirstOrDefault(a => a.Code == "PQC");

        if (sgn != null && han != null && dad != null && pqc != null)
        {
            var flights = new List<Flight>
            {
                // SGN to HAN
                new Flight 
                { 
                    FlightNumber = "VN100", 
                    DepartureAirportId = sgn.Id, 
                    ArrivalAirportId = han.Id, 
                    DepartureTime = new DateTime(2026, 5, 15, 6, 0, 0), 
                    ArrivalTime = new DateTime(2026, 5, 15, 8, 15, 0), 
                    Price = 1500000m, 
                    TotalSeats = 180 
                },
                new Flight 
                { 
                    FlightNumber = "VJ101", 
                    DepartureAirportId = sgn.Id, 
                    ArrivalAirportId = han.Id, 
                    DepartureTime = new DateTime(2026, 5, 15, 9, 30, 0), 
                    ArrivalTime = new DateTime(2026, 5, 15, 11, 45, 0), 
                    Price = 1200000m, 
                    TotalSeats = 180 
                },
                new Flight 
                { 
                    FlightNumber = "BA102", 
                    DepartureAirportId = sgn.Id, 
                    ArrivalAirportId = han.Id, 
                    DepartureTime = new DateTime(2026, 5, 15, 14, 0, 0), 
                    ArrivalTime = new DateTime(2026, 5, 15, 16, 15, 0), 
                    Price = 2000000m, 
                    TotalSeats = 250 
                },
                // HAN to SGN
                new Flight 
                { 
                    FlightNumber = "VN200", 
                    DepartureAirportId = han.Id, 
                    ArrivalAirportId = sgn.Id, 
                    DepartureTime = new DateTime(2026, 5, 15, 10, 0, 0), 
                    ArrivalTime = new DateTime(2026, 5, 15, 12, 15, 0), 
                    Price = 1500000m, 
                    TotalSeats = 180 
                },
                new Flight 
                { 
                    FlightNumber = "VJ201", 
                    DepartureAirportId = han.Id, 
                    ArrivalAirportId = sgn.Id, 
                    DepartureTime = new DateTime(2026, 5, 15, 13, 30, 0), 
                    ArrivalTime = new DateTime(2026, 5, 15, 15, 45, 0), 
                    Price = 1200000m, 
                    TotalSeats = 180 
                },
                // SGN to DAD
                new Flight 
                { 
                    FlightNumber = "VN300", 
                    DepartureAirportId = sgn.Id, 
                    ArrivalAirportId = dad.Id, 
                    DepartureTime = new DateTime(2026, 5, 15, 7, 0, 0), 
                    ArrivalTime = new DateTime(2026, 5, 15, 8, 30, 0), 
                    Price = 1000000m, 
                    TotalSeats = 180 
                },
                new Flight 
                { 
                    FlightNumber = "VJ302", 
                    DepartureAirportId = sgn.Id, 
                    ArrivalAirportId = dad.Id, 
                    DepartureTime = new DateTime(2026, 5, 15, 12, 0, 0), 
                    ArrivalTime = new DateTime(2026, 5, 15, 13, 30, 0), 
                    Price = 900000m, 
                    TotalSeats = 180 
                },
                // DAD to SGN
                new Flight 
                { 
                    FlightNumber = "VN400", 
                    DepartureAirportId = dad.Id, 
                    ArrivalAirportId = sgn.Id, 
                    DepartureTime = new DateTime(2026, 5, 15, 9, 0, 0), 
                    ArrivalTime = new DateTime(2026, 5, 15, 10, 30, 0), 
                    Price = 1000000m, 
                    TotalSeats = 180 
                },
                new Flight 
                { 
                    FlightNumber = "VJ401", 
                    DepartureAirportId = dad.Id, 
                    ArrivalAirportId = sgn.Id, 
                    DepartureTime = new DateTime(2026, 5, 15, 14, 30, 0), 
                    ArrivalTime = new DateTime(2026, 5, 15, 16, 0, 0), 
                    Price = 900000m, 
                    TotalSeats = 180 
                },
                // SGN to PQC
                new Flight 
                { 
                    FlightNumber = "VN500", 
                    DepartureAirportId = sgn.Id, 
                    ArrivalAirportId = pqc.Id, 
                    DepartureTime = new DateTime(2026, 5, 15, 8, 0, 0), 
                    ArrivalTime = new DateTime(2026, 5, 15, 9, 15, 0), 
                    Price = 800000m, 
                    TotalSeats = 150 
                },
                new Flight 
                { 
                    FlightNumber = "VJ501", 
                    DepartureAirportId = sgn.Id, 
                    ArrivalAirportId = pqc.Id, 
                    DepartureTime = new DateTime(2026, 5, 15, 15, 30, 0), 
                    ArrivalTime = new DateTime(2026, 5, 15, 16, 45, 0), 
                    Price = 750000m, 
                    TotalSeats = 150 
                },
                // PQC to SGN
                new Flight 
                { 
                    FlightNumber = "VN600", 
                    DepartureAirportId = pqc.Id, 
                    ArrivalAirportId = sgn.Id, 
                    DepartureTime = new DateTime(2026, 5, 15, 10, 0, 0), 
                    ArrivalTime = new DateTime(2026, 5, 15, 11, 15, 0), 
                    Price = 800000m, 
                    TotalSeats = 150 
                },
                new Flight 
                { 
                    FlightNumber = "VJ601", 
                    DepartureAirportId = pqc.Id, 
                    ArrivalAirportId = sgn.Id, 
                    DepartureTime = new DateTime(2026, 5, 15, 17, 0, 0), 
                    ArrivalTime = new DateTime(2026, 5, 15, 18, 15, 0), 
                    Price = 750000m, 
                    TotalSeats = 150 
                }
            };
            db.Flights.AddRange(flights);
            db.SaveChanges();
        }
    }

    var adminEmail = "admin@kangaroo.com";
    var adminPassword = "Admin@2026!";

    var existingAdmin = db.Users.SingleOrDefault(u => u.Email == adminEmail);
    if (existingAdmin == null)
    {
        db.Users.Add(new User
        {
            Username = "Admin",
            Email = adminEmail,
            HashedPassword = auth.HashPassword(adminPassword),
            Role = "admin",
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();
    }
}

app.MapControllers();

// Health endpoint for Docker healthchecks
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.Run();

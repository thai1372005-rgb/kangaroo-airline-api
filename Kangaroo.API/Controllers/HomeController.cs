using Microsoft.AspNetCore.Mvc;

namespace Kangaroo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        [HttpGet("")]
        public IActionResult Get() => Ok(new { message = "Welcome to Kangaroo Airline v2.0!", status = "Ready to Fly", version = "2.0" });

        [HttpGet("health")]
        public IActionResult Health() => Ok(new { status = "healthy" });
    }
}

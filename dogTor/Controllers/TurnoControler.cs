using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace dogTor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TurnoControler : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok();
        }
    }
}

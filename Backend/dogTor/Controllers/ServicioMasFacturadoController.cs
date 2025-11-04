using dogTor.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dogTor.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class ServicioMasFacturadoController : ControllerBase
    {
        private readonly IServicioMasFacturadoRepository _repo;

        public ServicioMasFacturadoController(IServicioMasFacturadoRepository repo)
        {
            _repo = repo;
        }

        // GET: api/ServicioMasFacturado?fecMin=2025-10-01&fecMax=2025-10-31
        [HttpGet]
        public async Task<IActionResult> GetAllServicios([FromQuery] DateTime? fecMin, [FromQuery] DateTime? fecMax)
        {
            try
            {
                var servicios = await _repo.GetAllAtencion(fecMin, fecMax);

                if (servicios == null || !servicios.Any())
                    return NotFound(new { message = "No se encontraron servicios en el rango indicado." });

                return Ok(servicios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener los servicios más facturados", error = ex.Message });
            }
        }
    }
}

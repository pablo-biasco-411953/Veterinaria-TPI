using dogTor.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace dogTor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicioMasFacturadoController : ControllerBase
    {
        private readonly IServicioMasFacturadoRepository _repo;

        public ServicioMasFacturadoController(IServicioMasFacturadoRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("GetAllServicios")]

        public async Task<IActionResult> GetAllServicios(DateTime? fechMin, DateTime? fecMax)
        {
            try
            {
                var servicio = await _repo.GetAllAtencion(fechMin, fecMax);

                return Ok(servicio);
            }
            catch (Exception)
            {

                throw;
            }
        }
    }
}

using dogTor.Repositories.Implementations;
using dogTor.Repositories.Interfaces;
using dogTor.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace dogTor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        public readonly IServicioReservadoRepository _servicioReservadoRepository;
        public DashboardController(IServicioReservadoRepository servicioReservadoRepository)
        {
            _servicioReservadoRepository = servicioReservadoRepository;
        }


        [HttpGet("mondongo")]
        public async Task<IActionResult> GetTiposMascota()
        {
            try
            {
                var tipos = await _servicioReservadoRepository.GetTopServicioReservadoList();

                if (tipos == null || tipos.Count == 0)
                {
                    return NotFound("No se encontraron tipos de mascota.");
                }

                return Ok(tipos);
            }
            catch
            {
                return StatusCode(500, "Error interno al recuperar esto.");
            }
        }

    }
}

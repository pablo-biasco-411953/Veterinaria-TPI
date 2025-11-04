using dogTor.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Globalization;
using System.Threading.Tasks;

namespace dogTor.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IServicioReservadoRepository _servicioReservadoRepository;

        public DashboardController(IServicioReservadoRepository servicioReservadoRepository)
        {
            _servicioReservadoRepository = servicioReservadoRepository;
        }

        [HttpGet("GetTopServiciosReservados")]
        public async Task<IActionResult> GetTopServiciosReservados([FromQuery] string? mes = null)
        {
            try
            {
                DateTime? fechaFiltro = null;

                if (!string.IsNullOrEmpty(mes) &&
                    DateTime.TryParseExact(mes, "yyyy-MM", CultureInfo.InvariantCulture, DateTimeStyles.None, out var fechaParsed))
                {
                    fechaFiltro = fechaParsed;
                }

                var tipos = await _servicioReservadoRepository.GetTopServicioReservadoList(fechaFiltro);

                if (tipos == null || tipos.Count == 0)
                    return NotFound("No se encontraron servicios reservados para el mes seleccionado.");

                return Ok(tipos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno al recuperar los servicios reservados: {ex.Message}");
            }
        }
    }
}

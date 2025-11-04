using dogTor.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace dogTor.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class VeterinarioConMasTurnosController : ControllerBase
    {
        private readonly IVeterinarioConMasTurnos _repo;

        public VeterinarioConMasTurnosController(IVeterinarioConMasTurnos repo)
        {
            _repo = repo;
        }

        // GET: api/VeterinarioConMasTurnos
        [HttpGet]
        public async Task<IActionResult> GetTopVeterinarios(
            [FromQuery] DateTime? fechaInicio,
            [FromQuery] DateTime? fechaFin,
            [FromQuery] int topN = 5)
        {
            if (topN <= 0)
            {
                return BadRequest(new { message = "El valor de 'topN' debe ser un número positivo." });
            }

            if (fechaInicio == null && fechaFin == null)
            {
                fechaInicio = DateTime.Today;
                fechaFin = DateTime.Today.AddDays(7);
            }
            try
            {
                var topVeterinarios = await _repo.GetTopVeterinariosByTurnosAsync(fechaInicio, fechaFin, topN);

                if (topVeterinarios == null || !topVeterinarios.Any())
                    return NotFound(new { message = "No se encontraron veterinarios con turnos registrados en el período especificado." });

                return Ok(topVeterinarios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener el ranking de veterinarios.", error = ex.Message });
            }
        }
    }
}
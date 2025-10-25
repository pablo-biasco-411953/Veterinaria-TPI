using dogTor.Dtos;
using dogTor.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dogTor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TurnosController : ControllerBase
    {
        private readonly IAtencionService _atencionService;

        public TurnosController(IAtencionService atencionService)
        {
            _atencionService = atencionService;
        }

        // POST /api/turnos
        // Crear un nuevo turno / atención
        [HttpPost]
        public async Task<IActionResult> RegistrarTurno([FromBody] DtoAtencion atencionDto)
        {
            if (atencionDto == null)
            {
                return BadRequest("Datos inválidos.");
            }

            try
            {
                var nuevoTurno = await _atencionService.RegistrarAtencionAsync(atencionDto);

                if (nuevoTurno == null)
                {
                    return StatusCode(500, "No se pudo crear el turno.");
                }

                return StatusCode(201, nuevoTurno);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch
            {
                return StatusCode(500, "Error interno al procesar el turno.");
            }
        }

        // GET /api/turnos
        // Obtener todas las atenciones / turnos
        [HttpGet]
        public async Task<IActionResult> GetAtenciones()
        {
            try
            {
                var atenciones = await _atencionService.GetAllAtencionesAsync();

                if (atenciones == null || atenciones.Count == 0)
                {
                    return NotFound("No se encontraron atenciones.");
                }

                return Ok(atenciones);
            }
            catch
            {
                return StatusCode(500, "Error interno al recuperar las atenciones.");
            }
        }

        // GET /api/turnos/disponibilidad
        // Obtener la disponibilidad de turnos
        [HttpGet("disponibilidad")]
        public async Task<IActionResult> GetDisponibilidad()
        {
            try
            {
                var disponibilidad = await _atencionService.GetDisponibilidadFechaAsync();

                if (disponibilidad == null || disponibilidad.Count == 0)
                {
                    return NotFound("No hay disponibilidad registrada.");
                }

                return Ok(disponibilidad);
            }
            catch
            {
                return StatusCode(500, "Error interno al recuperar la disponibilidad.");
            }
        }

        // GET /api/turnos/tipos
        // Obtener los tipos de atención
        [HttpGet("tipos")]
        public async Task<IActionResult> GetTiposAtencion()
        {
            try
            {
                var tipos = await _atencionService.GetTiposAtencionAsync();

                if (tipos == null || tipos.Count == 0)
                {
                    return NotFound("No se encontraron tipos de atención.");
                }

                return Ok(tipos);
            }
            catch
            {
                return StatusCode(500, "Error interno al recuperar los tipos de atención.");
            }
        }
    }
}

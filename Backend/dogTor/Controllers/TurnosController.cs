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
        [HttpPost("insertar/{codDisponibilidad}")]
        public async Task<IActionResult> RegistrarTurno(int codDisponibilidad, [FromBody] DtoAtencion atencionDto)
        {
            if (atencionDto == null)
                return BadRequest("Datos inválidos.");

            try
            {
                var nuevoTurno = await _atencionService.RegistrarAtencionAsync(atencionDto, codDisponibilidad);

                if (nuevoTurno == null)
                    return StatusCode(500, "No se pudo crear el turno.");

                return StatusCode(201, nuevoTurno);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno al procesar el turno: " + ex.Message });
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

        [HttpGet("AtencionesxCliente/{clienteId}")]
        public async Task<IActionResult> GetAtencionesByClienteId(int clienteId)
        {
            try
            {
                var atenciones = await _atencionService.GetAtencionesByClienteIdAsync(clienteId);

                if (atenciones == null || atenciones.Count == 0)
                    return NotFound($"No se encontraron atenciones para el cliente con ID {clienteId}.");

                return Ok(atenciones);
            }
            catch
            {
                return StatusCode(500, "Error interno al recuperar las atenciones del cliente.");
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

        [HttpGet("horas-libres")]
        public async Task<IActionResult> GetHorasDisponibles([FromQuery] string fecha)
        {
            // 1. Validación y Conversión de la fecha
            if (string.IsNullOrEmpty(fecha) || !DateTime.TryParse(fecha, out DateTime fechaDT))
            {
                return BadRequest("El formato de fecha es inválido o no fue proporcionado.");
            }

            try
            {
                // 2. Llamada al servicio
                var disponibilidad = await _atencionService.GetDisponibilidadPorFechaAsync(fechaDT);

                if (disponibilidad == null || disponibilidad.Count == 0)
                {
                    // Devuelve 404 si no hay resultados para una mejor experiencia de usuario en el frontend
                    return NotFound(new { message = "No hay horarios libres para esta fecha." });
                }

                // 3. Devolución de los DTOs
                return Ok(disponibilidad);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno al recuperar las horas disponibles." });
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
        [HttpGet("AtencionesxVeterinario/{veterinarioId}")]
        public async Task<IActionResult> GetAtencionesByVeterinarioId(int veterinarioId)
        {

            try
            {
                var atenciones = await _atencionService.GetAtencionesByVeterinarioIdAsync(veterinarioId);

                if (atenciones == null || atenciones.Count == 0)
                {
                    return NotFound($"No se encontraron atenciones asignadas al veterinario con ID {veterinarioId}.");
                }

                return Ok(atenciones);
            }
            catch (Exception)
            {
                return StatusCode(500, "Error interno al recuperar las atenciones del veterinario.");
            }
        }

        // PUT /api/turnos/estado/{codDisponibilidad}
        [HttpPut("estado/{codDisponibilidad}")]
        public async Task<IActionResult> ActualizarEstadoTurno(int codDisponibilidad, [FromQuery] int nuevoEstado)
        {
            try
            {
                var disponibilidadActualizada = await _atencionService.ActualizarEstadoDisponibilidadAsync(codDisponibilidad, nuevoEstado);

                return Ok(disponibilidadActualizada);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno al actualizar el estado del turno: " + ex.Message });
            }
        }


    }
}

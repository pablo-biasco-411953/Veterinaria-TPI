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

        // Inyección de Dependencia del Servicio
        public TurnosController(IAtencionService atencionService)
        {
            _atencionService = atencionService;
        }

        // -------------------------------------------------------------------
        // ENDPOINT 1: REGISTRAR NUEVA ATENCIÓN / TURNO (POST)
        // -------------------------------------------------------------------
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RegistrarTurno([FromBody] DtoAtencion atencionDto)
        {
            if (!ModelState.IsValid || atencionDto == null)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // El servicio maneja la validación de ID, el mapeo, la transacción y la reserva de Disponibilidad.
                DtoAtencion nuevoTurno = await _atencionService.RegistrarAtencionAsync(atencionDto);

                // Devuelve el recurso creado con el ID generado.
                return CreatedAtAction(
                    nameof(GetAtenciones), // Opcionalmente, puedes usar otro método GET más específico
                    new { id = nuevoTurno.CodAtencion },
                    nuevoTurno
                );
            }
            catch (ArgumentException ex)
            {
                // Captura errores de validación del DTO
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                // Captura errores de lógica de negocio
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                // Error interno o de base de datos no específico.
                return StatusCode(StatusCodes.Status500InternalServerError, "Error interno del servidor al procesar el turno.");
            }
        }

        // -------------------------------------------------------------------
        // ENDPOINT 2: OBTENER TODAS LAS ATENCIONES (GET)
        // -------------------------------------------------------------------
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAtenciones()
        {
            List<DtoAtencion> atenciones = await _atencionService.GetAllAtencionesAsync();

            // Devuelve 200 OK con una lista vacía si no hay datos.
            return Ok(atenciones);
        }

        // -------------------------------------------------------------------
        // ENDPOINT 3: OBTENER DISPONIBILIDAD (GET)
        // -------------------------------------------------------------------
        [HttpGet("disponibilidad")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDisponibilidad()
        {
            List<DtoDisponibilidad> disponibilidad = await _atencionService.GetDisponibilidadFechaAsync();
            return Ok(disponibilidad);
        }

        // -------------------------------------------------------------------
        // ENDPOINT 4: OBTENER CATÁLOGO DE TIPOS DE ATENCIÓN (GET)
        // -------------------------------------------------------------------
        [HttpGet("tipos")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTiposAtencion()
        {
            List<DtoTipoAtencion> tipos = await _atencionService.GetTiposAtencionAsync();
            return Ok(tipos);
        }
    }
}
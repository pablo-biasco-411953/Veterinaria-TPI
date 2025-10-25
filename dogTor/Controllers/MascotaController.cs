using dogTor.Controllers;
using dogTor.Dtos;
using dogTor.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace dogTor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MascotaController : ControllerBase
    {
        private readonly IMascotaService _mascotaService;

        // Inyección del Servicio de Mascota
        public MascotaController(IMascotaService mascotaService)
        {
            _mascotaService = mascotaService;
        }


        [HttpPost]
        public async Task<IActionResult> RegistrarMascota([FromBody] DtoMascota mascotaDto)
        {
            if (!ModelState.IsValid || mascotaDto == null)
            {
                return BadRequest(ModelState);
            }

            try
            {
                DtoMascota nuevaMascota = await _mascotaService.CreateMascotaAsync(mascotaDto);

                return CreatedAtAction(
                    nameof(GetMascotasByCliente),
                    new { userId = nuevaMascota.cliente?.CodCliente },
                    nuevaMascota
                );
            }
            catch (ArgumentException ex)
            {
                // Captura de errores de validación de negocio
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                // Captura de errores genéricos
                return StatusCode(StatusCodes.Status500InternalServerError, "Error interno al intentar registrar la mascota.");
            }
        }

        [HttpGet("cliente/{userId}")]
        public async Task<IActionResult> GetMascotasByCliente(int userId)
        {
            try
            {
                List<DtoMascota> mascotas = await _mascotaService.GetAllByUserIdAsync(userId);

                if (mascotas == null || !mascotas.Any())
                {
                    return NotFound($"No se encontraron mascotas para el cliente con ID {userId}.");
                }

                return Ok(mascotas);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error al recuperar las mascotas.");
            }
        }


        [HttpGet("tipos")]
        public async Task<IActionResult> GetTiposMascota()
        {
            try
            {
                List<DtoTipoMascota> tipos = await _mascotaService.GetTiposMascotaAsync();
                return Ok(tipos);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error al recuperar el catálogo de tipos de mascota.");
            }
        }

   
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMascotaById(int id)
        {
            try
            {
                DtoMascota mascota = await _mascotaService.GetMascotaByIdAsync(id);
                return Ok(mascota);
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Mascota con ID {id} no encontrada.");
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error al recuperar la mascota.");
            }
        }
    }
}
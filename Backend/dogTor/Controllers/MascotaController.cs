using dogTor.Dtos;
using dogTor.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dogTor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MascotaController : ControllerBase
    {
        private readonly IMascotaService _mascotaService;

        public MascotaController(IMascotaService mascotaService)
        {
            _mascotaService = mascotaService;
        }

        // POST /api/mascota
        // Registrar una nueva mascota
        [HttpPost]
        public async Task<IActionResult> RegistrarMascota([FromBody] DtoMascota mascotaDto)
        {
            if (mascotaDto == null)
            {
                return BadRequest("Datos inválidos.");
            }

            try
            {
                var nuevaMascota = await _mascotaService.CreateMascotaAsync(mascotaDto);

                if (nuevaMascota == null)
                {
                    return StatusCode(500, "No se pudo registrar la mascota.");
                }

                return StatusCode(201, nuevaMascota);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch
            {
                return StatusCode(500, "Error interno al registrar la mascota.");
            }
        }

        // GET /api/mascota/cliente/{userId}
        // Obtener todas las mascotas de un cliente
        [HttpGet("cliente/{userId}")]
        public async Task<IActionResult> GetMascotasByCliente(int userId)
        {
            try
            {
                var mascotas = await _mascotaService.GetAllByUserIdAsync(userId);

               if (mascotas == null || mascotas.Count == 0)
                {
                    return NotFound($"No se encontraron mascotas para el cliente con ID {userId}.");
                }

                return Ok(mascotas);
            }
            catch
            {
                return StatusCode(500, "Error interno al recuperar las mascotas.");
            }
        }

        // GET /api/mascota/tipos
        // Obtener catálogo de tipos de mascota
        [HttpGet("tipos")]
        public async Task<IActionResult> GetTiposMascota()
        {
            try
            {
                var tipos = await _mascotaService.GetTiposMascotaAsync();

                if (tipos == null || tipos.Count == 0)
                {
                    return NotFound("No se encontraron tipos de mascota.");
                }

                return Ok(tipos);
            }
            catch
            {
                return StatusCode(500, "Error interno al recuperar los tipos de mascota.");
            }
        }

        // GET /api/mascota/{id}
        // Obtener una mascota por su ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMascotaById(int id)
        {
            try
            {
                var mascota = await _mascotaService.GetMascotaByIdAsync(id);

                if (mascota == null)
                {
                    return NotFound($"Mascota con ID {id} no encontrada.");
                }

                return Ok(mascota);
            }
            catch
            {
                return StatusCode(500, "Error interno al recuperar la mascota.");
            }
        }
    }
}

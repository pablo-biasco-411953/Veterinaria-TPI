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
    public class MascotasController : ControllerBase
    {
        private readonly IMascotaService _mascotaService;

        public MascotasController(IMascotaService mascotaService)
        {
            _mascotaService = mascotaService;
        }

        // POST /api/mascota
        // Registrar una nueva mascota
        [HttpPost]
        public async Task<IActionResult> RegistrarMascota([FromBody] DtoMascota mascotaDto)
        {
            if (mascotaDto == null)
                return BadRequest(new { message = "Datos inválidos." });

            try
            {
                var nuevaMascota = await _mascotaService.CreateMascotaAsync(mascotaDto);

                if (nuevaMascota == null)
                    return StatusCode(500, new { message = "No se pudo registrar la mascota." });

                return StatusCode(201, nuevaMascota);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno al registrar la mascota." });
            }
        }


        // GET /api/mascota/cliente/{userId}
        // Obtener todas las mascotas de un cliente
        [HttpGet]
        public async Task<IActionResult> GetMascotas()
        {
            try
            {
                var mascotas = await _mascotaService.GetAll();

               if (mascotas == null || mascotas.Count == 0)
                {
                    return NotFound($"No se encontraron mascotas.");
                }

                return Ok(mascotas);
            }
            catch
            {
                return StatusCode(500, "Error interno al recuperar las mascotas.");
            }
        }

        [HttpGet("cliente/{codCliente}")]
        public async Task<IActionResult> GetMascotasByCliente(int codCliente)
        {
            try
            {
                var mascotas = await _mascotaService.GetMascotasByClienteIdAsync(codCliente);

                if (mascotas == null || mascotas.Count == 0)
                {
                    return NotFound($"No se encontraron mascotas para el cliente con ID {codCliente}.");
                }

                return Ok(mascotas);
            }
            catch (KeyNotFoundException ex)
            {
                // Si quieres manejar la excepción específica de la mascota por ID, puedes hacerlo aquí
                return NotFound(new { message = ex.Message });
            }
            catch
            {
                return StatusCode(500, "Error interno al recuperar las mascotas por cliente.");
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

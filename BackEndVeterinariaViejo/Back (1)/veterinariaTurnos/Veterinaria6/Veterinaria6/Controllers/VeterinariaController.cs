using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veterinaria6.Models;
using Veterinaria6.Repository;
using Veterinaria6.Services;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Veterinaria6.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VeterinariaController : ControllerBase
    {
        private IVeterinariaService _service;
        public VeterinariaController(IVeterinariaService service)
        {
            _service = service;
        }
        [Authorize]
        [HttpGet("GetTiposAtencion")]
        public async Task<IActionResult> GetTiposAtencion()
        {
            try
            {
                var tiposAtencion = await _service.GetTiposAtencion();
                return Ok(tiposAtencion);
            }
            catch (Exception)
            {
                return StatusCode(500, "Error interno");
            }
        }

        [Authorize]
        [HttpGet("GetFecha")]
        public async Task<IActionResult> GetDisponibilidadFecha()
        {
            try
            {
                var fecha = await _service.GetDisponibilidadFecha();
                return Ok(fecha);
            }
            catch (Exception)
            {
                return StatusCode(500, "Error interno");
            }
        }

        [Authorize]
        [HttpGet("GetHora")]
        public async Task<IActionResult> GetDisponibilidadHora()
        {
            try
            {
                var hora = await _service.GetDisponibilidadHora();
                return Ok(hora);
            }
            catch (Exception)
            {
                return StatusCode(500, "Error interno");
            }
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var atencion = await _service.GetAll();
                return Ok(atencion);
            }
            catch (Exception)
            {
                return StatusCode(500, "Error interno");
            }
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAllID(int id)
        {
            try
            {
                var atencion = await _service.GetAllID(id); // Usar await aquí
                if (atencion == null || !atencion.Any())
                {
                    return NotFound(); // Devuelve un 404 si no se encuentra la atención
                }
                return Ok(atencion); // Devuelve la atención encontrada
            }
            catch (Exception)
            {
                return StatusCode(500, "Error interno");
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Atencion atencion)
        {
            
            if (atencion == null || atencion.CodDisponibilidad == 0 || atencion.CodMascota == 0 || !atencion.DetalleAtencions.Any())
            {
                return BadRequest("Datos incompletos.");
            }

            try
            {
                
                if (validar(atencion))
                {
                    var result = await _service.Insert(atencion, atencion.CodDisponibilidad);
                    if (result)
                    {
                        return Ok("Atención insertada con éxito");
                    }
                    return BadRequest("No se pudo insertar la atención.");
                }
                return BadRequest("Error en algún campo");
            }
            catch (Exception)
            {
                return StatusCode(500, "Error interno");
            }
        }



        private bool validar(Atencion atencion)
        {
            return atencion.CodMascota > 0
             && atencion.CodDisponibilidad > 0;
            
        }


        // DELETE api/<VeterinariaController>/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.Delete(id);
                return Ok("Turno eliminado con éxito");
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Turno no encontrado"); // Respuesta 404 Not Found
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno del servidor", detalle = ex.Message });
            }
        }
    }
}

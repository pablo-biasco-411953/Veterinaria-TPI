using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veterinaria6.Models;
using Veterinaria6.Services;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Veterinaria6.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MascotaController : ControllerBase
    {
        private IMascotaService _service;
        public MascotaController(IMascotaService service)
        {
            _service = service;
        }
        // GET: api/<MascotaController>
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var userId = GetUserId();
                var mascotas = await _service.GetAll(userId);
                return Ok(mascotas);
            }
            catch (Exception)
            {

                return StatusCode(500, "Ocurrió un error interno");
            }
        }

        [Authorize]
        [HttpGet("/api/tiposMascota")]
        public async Task<IActionResult> GetTipos()
        {
            try
            {
                var tipos = await _service.GetTipos();
                return Ok(tipos);
            }
            catch (Exception)
            {

                return StatusCode(500, "Ocurrió un error interno");
            }
        }

        // GET api/<MascotaController>/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var found= await _service.GetById(id);
                if (found == null)
                {
                    return NotFound("No se ha encontrado una mascota con ese id");
                }
                return Ok(found);
            }
            catch (Exception)
            {

                return StatusCode(500, "Ocurrió un error interno");
            }
        }

        // POST api/<MascotaController>
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Mascotum mascota)
        {
            try
            {
                if (mascota.Edad < -1 || mascota.Edad > 20)
                {
                    return BadRequest("La edad es incorrecta");
                }
                if (_service.IsValid(mascota))
                {
                    mascota.CodCliente = GetUserId();
                    await _service.Create(mascota);
                    return Ok("La mascota se ha creado con exito");
                }
                return BadRequest("Datos incorrectos");
            }
            catch (Exception)
            {

                return StatusCode(500, "Ocurrió un error interno");
            }
            
        }

        // PUT api/<MascotaController>/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Mascotum mascota)
        {
            try
            {
                if (mascota != null)
                {
                    await _service.Update(mascota, id);
                    return Ok("Se ha modificado la mascota correctamente");
                }
                else
                {
                    return BadRequest("Los datos ingresados para la modificación son incorrectos");
                }

            }
            catch (Exception)
            {

                return StatusCode(500, "Ocurrió un error interno");
            }
        }

        // DELETE api/<MascotaController>/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var found = await _service.GetById(id);
                if (found == null)
                {
                    return NotFound("No se ha encontrado una mascota con ese id");
                }
                await _service.Delete(id);
                return Ok("Se ha dado de bajo la mascota");
            }
            catch (Exception)
            {

                return StatusCode(500, "Ocurrió un error interno");
            }
        }
        private int GetUserId()
        {

            var user = User;
            var userId = User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;

            return int.Parse(userId);
        }
    }
}

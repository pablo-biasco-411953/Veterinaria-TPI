using dogTor.Dtos;
using dogTor.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace dogTor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientesController : ControllerBase
    {
        private readonly IClienteService _clienteService;

        public ClientesController(IClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        // ============================
        // GET: api/Clientes
        // ============================
        [HttpGet]
        public async Task<ActionResult<List<DtoCliente>>> GetAll()
        {
            var clientes = await _clienteService.GetAllAsync();
            if (clientes == null || !clientes.Any())
                return NotFound("No se encontraron clientes registrados.");

            return Ok(clientes);
        }

        // ============================
        // GET: api/Clientes/{dni}
        // ============================
        [HttpGet("{dni:int}")]
        public async Task<ActionResult<List<DtoCliente>>> GetByDni(int dni)
        {
            if (dni <= 0)
                return BadRequest("El DNI debe ser un número positivo.");

            var cliente = await _clienteService.GetClienteByDNIAsync(dni);
            if (cliente == null || !cliente.Any())
                return NotFound($"No se encontró ningún cliente con el DNI {dni}.");

            return Ok(cliente);
        }

        // ============================
        // POST: api/Clientes
        // ============================
        [HttpPost]
        public async Task<ActionResult> CreateCliente([FromBody] DtoCliente nuevoCliente)
        {
            if (nuevoCliente == null)
                return BadRequest("Los datos del cliente son obligatorios.");

            if (nuevoCliente.Dni == null || nuevoCliente.Dni <= 0)
                return BadRequest("El DNI del cliente no es válido.");

            try
            {
                var creado = await _clienteService.CreateClienteAsync(nuevoCliente);
                if (!creado)
                    return StatusCode(500, "No se pudo crear el cliente.");

                return Ok(new { message = "Cliente creado correctamente." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor.", detail = ex.Message });
            }
        }
    }
}

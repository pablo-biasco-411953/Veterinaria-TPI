using dogTor.Dtos;
using dogTor.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Configuration; 

namespace dogTor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;

        public UserController(IUserService userService, IConfiguration configuration)
        {
            _userService = userService;
            _configuration = configuration;
        }

        // -------------------------------------------------------------------
        // ENDPOINT 1: REGISTRAR NUEVO USUARIO/CLIENTE (POST /api/User)
        // -------------------------------------------------------------------
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> RegistrarUsuario([FromBody] DtoCliente usuarioDto) // Usa el DTO
        {
            if (!ModelState.IsValid || usuarioDto == null)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // El Servicio maneja el mapeo, hashing, y validación de unicidad.
                DtoCliente nuevoUsuario = await _userService.RegisterUserAsync(usuarioDto);

                // Retornar el DTO limpio (sin password) con el CodCliente generado.
                return CreatedAtAction(nameof(RegistrarUsuario), new { id = nuevoUsuario.CodCliente }, nuevoUsuario);
            }
            catch (InvalidOperationException ex)
            {
                // Captura el error de unicidad del Username, lanzado por el servicio
                return Conflict(new { message = ex.Message }); // 409 Conflict
            }
            catch (ArgumentException ex)
            {
                // Captura errores de datos faltantes (ej: Password o Username vacío)
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error interno al registrar el usuario.");
            }
        }

        // -------------------------------------------------------------------
        // ENDPOINT 2: LOGIN Y GENERACIÓN DE TOKEN (POST /api/User/login)
        // -------------------------------------------------------------------
        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] DtoCredencialesLogin credenciales) // Usa el DTO de login
        {
            try
            {
                // El Servicio verifica la contraseña hasheada y devuelve el DTO del usuario
                DtoCliente userDto = await _userService.LoginAsync(credenciales);

                // Generar el token solo si el login fue exitoso
                var token = GenerateJwtToken(userDto.Username, userDto.CodCliente.Value);

                return Ok(new { Token = token });
            }
            catch (UnauthorizedAccessException)
            {
                // Captura el error de credenciales inválidas lanzado por el servicio
                return Unauthorized(new { message = "Usuario o contraseña incorrectos." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error interno durante el proceso de login.");
            }
        }

        // -------------------------------------------------------------------
        // MÉTODO PRIVADO: GENERACIÓN DE JWT (Se mantiene la lógica)
        // -------------------------------------------------------------------
        private string GenerateJwtToken(string username, int userId)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim("userId", userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(120),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
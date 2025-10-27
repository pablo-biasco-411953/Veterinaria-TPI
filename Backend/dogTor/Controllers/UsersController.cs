using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using dogTor.Dtos;
using dogTor.Services.Interfaces;
using System.Threading.Tasks;
using System;

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

        [HttpPost("register")]
        public async Task<IActionResult> CrearUsuario([FromBody] DtoVeterinario usuarioDto)
            {
            if (usuarioDto == null)
            {
                return BadRequest("Datos inválidos");
            }
            try
            {
                DtoVeterinario nuevoUsuario = await _userService.RegisterVeterinarioAsync(usuarioDto);
                return Ok(new { Message = "Veterinario creado con éxito", Usuario = nuevoUsuario });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { Message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch
            {
                return StatusCode(500, "Error interno al crear veterinario");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] DtoCredencialesLogin credentials)
        {
            if (credentials == null)
                return BadRequest("Datos inválidos");

            try
            {
                // 1. Authenticate the user (Veterinario)
                DtoVeterinario user = await _userService.LoginAsync(credentials);

                // 2. Generate the token
                // Use CodVeterinario and Email (or Matricula, depending on your JWT claims needs)
                // ⚠️ Assuming your GenerateJwtToken takes the user ID and a unique claim (like Email or Matricula).
                // If your original method expected DNI, you must update the implementation of GenerateJwtToken.
                var token = GenerateJwtToken(user.CodVeterinario.Value, user.Email);

                // 3. Return the response
                return Ok(new
                {
                    Token = token,
                    User = new
                    {
                        Id = user.CodVeterinario,
                        Nombre = user.Nombre,
                        Apellido = user.Apellido,
                        // ❌ DNI no existe en DtoVeterinario. Usar Matricula o Email.
                        Matricula = user.Matricula, // Usar Matricula o Email si es necesario en el front-end
                        Email = user.Email
                    }
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "Usuario o contraseña incorrectos" });
            }
            catch (Exception ex) // Captura específica de Exception para mejor manejo de errores
            {
                // Log the exception (recommended)
                // Console.error(ex.Message); 
                return StatusCode(500, "Error interno durante el login");
            }
        }

        private string GenerateJwtToken(int codVeterinario, string email)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim("id", codVeterinario.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

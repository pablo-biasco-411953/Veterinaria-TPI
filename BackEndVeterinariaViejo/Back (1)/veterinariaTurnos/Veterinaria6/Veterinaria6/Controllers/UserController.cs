using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Veterinaria6.Entity;
using Veterinaria6.Models;
using Veterinaria6.Repository;
using Veterinaria6.Services;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Veterinaria6.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private IUserService _service;
        private readonly IConfiguration _configuration;
        public UserController(IUserService service, IConfiguration configuration)
        {
            _service= service; 
            _configuration= configuration;
        }

        [HttpPost]

        public async Task<IActionResult> CrearUsuario([FromBody] Cliente usuario)
        {
            try
            {
                
                if (_service.IsValid(usuario))
                {
                    await _service.CreateUserAsync(usuario);
                    return Ok("El suario se ha creado con exito");
                }
                return BadRequest("Datos incorrectos");
            }
            catch (Exception)
            {

                return StatusCode(500, "Ocurrió un error interno");
            }
        }

        [HttpPost("/login")]
        public async Task<IActionResult> Login([FromBody] UserLogin objUserLogin)
        {
            // Obtiene el usuario desde la base de datos
            var user = await _service.GetUserByUsernameAsync(objUserLogin.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(objUserLogin.Password, user.Password))
            {
                return Unauthorized();  // Retorna 401 si el usuario no existe o la contraseña es incorrecta
            }

            var token = GenerateJwtToken(user.Username, user.CodCliente);
            return Ok(new { Token = token });
        }

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

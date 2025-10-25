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
        public async Task<IActionResult> CrearUsuario([FromBody] DtoCliente usuarioDto)
        {
            if (usuarioDto == null)
            {
                return BadRequest("Datos inválidos");
            }
            try
            {
                DtoCliente nuevoUsuario = await _userService.RegisterUserAsync(usuarioDto);
                return Ok(new { Message = "Usuario creado con éxito", Usuario = nuevoUsuario });
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
                return StatusCode(500, "Error interno al crear usuario");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] DtoCredencialesLogin credentials)
        {
            if (credentials == null)
                return BadRequest("Datos inválidos");

            try
            {
                DtoCliente user = await _userService.LoginAsync(credentials);

                var token = GenerateJwtToken(user.Dni ?? 0, user.CodCliente.Value);

                return Ok(new { Token = token });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "Usuario o contraseña incorrectos" });
            }
            catch
            {
                return StatusCode(500, "Error interno durante el login");
            }
        }

        private string GenerateJwtToken(int username, int userId)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, username.ToString()),
                new Claim("userId", userId.ToString()),
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

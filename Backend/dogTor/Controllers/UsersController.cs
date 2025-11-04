using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using dogTor.Dtos;
using dogTor.Services.Interfaces;
using System.Threading.Tasks;
using System;
using dogTor.Services.Implementations;

namespace dogTor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _configuration;
        private readonly EmailService _emailService;

        public UserController(IUserService userService, IConfiguration configuration, EmailService emailService)
        {
            _userService = userService;
            _configuration = configuration;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> CrearUsuario([FromBody] DtoVeterinario usuarioDto)
        {
            if (usuarioDto == null)
                return BadRequest(new { Message = "Datos inválidos" });

            try
            {
                var nuevoUsuario = await _userService.RegisterVeterinarioAsync(usuarioDto);

                if (nuevoUsuario == null)
                    return Conflict(new { Message = "El email ya está registrado." });

                return Ok(new { Message = "Veterinario creado con éxito", Usuario = nuevoUsuario });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return StatusCode(500, new { Message = "Error interno al crear veterinario", Detail = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] DtoCredencialesLogin credentials)
        {
            if (credentials == null)
                return BadRequest("Datos inválidos");

            try
            {
                DtoVeterinario user = await _userService.LoginAsync(credentials);

                var token = GenerateJwtToken(user.CodVeterinario.Value, user.Email, user.IsAdmin);

                return Ok(new
                {
                    Token = token,
                    User = new
                    {
                        Id = user.CodVeterinario,
                        Nombre = user.Nombre,
                        Apellido = user.Apellido,
                        Matricula = user.Matricula,
                        Email = user.Email,
                        IsAdmin = user.IsAdmin

                    }
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "Usuario o contraseña incorrectos" });
            }
            catch (Exception)
            {
                return StatusCode(500, "Error interno durante el login");
            }
        }

        // Recuperación de contraseña

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest(new { Message = "Debe ingresar un email válido." });
            
            var result = await _userService.ForgotPasswordAsync(email);

            if (result == null)
                return NotFound(new { Message = "No se encontró un usuario con ese email." });

            var token = result.Value.Token;
            var usuario = result.Value.Usuario;

            if (token == null)
                return NotFound(new { Message = "No se encontró un usuario con ese email." });
            var resetLink = $"http://127.0.0.1:5500/Pages/resetearContrase%C3%B1a.html?token={token}";
            var htmlBody = $@"
            <!DOCTYPE html>
            <html lang='es'>
            <head>
                <meta charset='UTF-8'>
                <title>Restablecer contraseña - DogTor</title>
                <style>
                    body {{
                        font-family: 'Poppins', sans-serif;
                        background-color: #1e1e2f;
                        color: #ffffff;
                        margin: 0;
                        padding: 0;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 50px auto;
                        background-color: #2c2c3e;
                        border-radius: 12px;
                        padding: 30px;
                        text-align: center;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    }}
                    h1 {{
                        font-family: 'Orbitron', sans-serif;
                        color: #ffcc00;
                        font-size: 24px;
                        margin-bottom: 20px;
                    }}
                    p {{
                        font-size: 16px;
                        line-height: 1.5;
                        color: #e0e0e0;
                    }}
                    .btn {{
                        display: inline-block;
                        margin-top: 25px;
                        padding: 12px 25px;
                        font-size: 16px;
                        color: #fff;
                        background-color: #ffcc00;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                    }}
                    .footer {{
                        margin-top: 30px;
                        font-size: 12px;
                        color: #999999;
                    }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <h1>DogTor — Restablecer Contraseña</h1>
                    <p>Hola <strong>{usuario.Nombre}</strong>,</p>
                    <p>Hacé clic en el siguiente botón para restablecer tu contraseña:</p>
                    <a href='{resetLink}' class='btn'>Restablecer Contraseña</a>
                    <p class='footer'>Si no solicitaste este cambio, ignorá este correo.</p>
                </div>
            </body>
            </html>
            ";
            try
            {
                await _emailService.SendEmailAsync(usuario.Email, "Restablecer contraseña - DogTor", htmlBody);

            }
            catch (Exception ex)
            {
                // Loguear error
                return StatusCode(500, new { Message = "No se pudo enviar el correo.", Error = ex.Message });
            }
            return Ok(new { Message = "Token generado con éxito y correo enviado.", Token = token });

        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] DtoResetearContraseña dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.NuevaContraseña))
                return BadRequest(new { Message = "Datos inválidos." });

            var success = await _userService.ResetPasswordAsync(dto.Token, dto.NuevaContraseña);

            if (!success)
                return BadRequest(new { Message = "Token inválido o expirado." });

            return Ok(new { Message = "Contraseña actualizada con éxito." });
        }

        // JWT  
        private string GenerateJwtToken(int codVeterinario, string email, bool isAdmin)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var role = isAdmin ? "Admin" : "Veterinario";

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim("id", codVeterinario.ToString()),
                new Claim(ClaimTypes.Role, role),
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

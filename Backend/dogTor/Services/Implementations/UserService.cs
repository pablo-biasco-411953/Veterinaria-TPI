using BCrypt.Net;
using dogTor.Dtos;
using dogTor.Models;
using dogTor.Repository;
using dogTor.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace dogTor.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        // REGISTRO
        public async Task<DtoVeterinario?> RegisterVeterinarioAsync(DtoVeterinario newVeterinarioDto)
        {
            var existingUser = await _userRepository.GetUserByUsernameAsync(newVeterinarioDto.Email);
            if (existingUser != null)
                return null;

            Veterinario veterinarioModel = new Veterinario
            {
                Nombre = newVeterinarioDto.Nombre ?? string.Empty,
                Apellido = newVeterinarioDto.Apellido ?? string.Empty,
                Email = newVeterinarioDto.Email ?? string.Empty,
                Matricula = newVeterinarioDto.Matricula ?? string.Empty,
                Password = BCrypt.Net.BCrypt.HashPassword(newVeterinarioDto.Password)
            };

            await _userRepository.CreateUserAsync(veterinarioModel);
            return new DtoVeterinario(veterinarioModel);
        }

        // LOGIN
        public async Task<DtoVeterinario> LoginAsync(DtoCredencialesLogin credentials)
        {
            Veterinario userModel = await _userRepository.GetUserByUsernameAsync(credentials.Username);

            if (userModel == null || !BCrypt.Net.BCrypt.Verify(credentials.Password, userModel.Password))
                throw new UnauthorizedAccessException("Credenciales de acceso inválidas.");

            return new DtoVeterinario(userModel);
        }

        // OLVIDÉ MI CONTRASEÑA
        public async Task<(string Token, DtoVeterinario Usuario)?> ForgotPasswordAsync(string email)
        {
            // Generar token y guardar en la base desde el repositorio
            var token = await _userRepository.GeneratePasswordResetTokenAsync(email);
            if (token == null) return null;

            // Obtener el usuario actualizado para crear el DTO
            var user = await _userRepository.GetUserByUsernameAsync(email);

            return (token, new DtoVeterinario(user));
        }



        // RESETEAR CONTRASEÑA
        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(newPassword))
                return false;

            // Se delega al repo, que ya hashea internamente
            var success = await _userRepository.ResetPasswordAsync(token, newPassword);
            return success;
        }
    }
}

// VeterinarioService.cs
using BCrypt.Net;
using dogTor.Dtos;
using dogTor.Models;
using dogTor.Repository;
using dogTor.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace dogTor.Services.Implementations
{
    // Usamos IUserRepository para la autenticación del "usuario" (Veterinario)
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<DtoVeterinario?> RegisterVeterinarioAsync(DtoVeterinario newVeterinarioDto)
        {
            // Validamos que el email (username) no esté registrado
            var existingUser = await _userRepository.GetUserByUsernameAsync(newVeterinarioDto.Email);
            if (existingUser != null)
            {
                // Devuelve null si ya existe
                return null;
            }

            Veterinario veterinarioModel = new Veterinario
            {
                Nombre = newVeterinarioDto.Nombre ?? string.Empty,
                Apellido = newVeterinarioDto.Apellido ?? string.Empty,
                Email = newVeterinarioDto.Email ?? string.Empty,
                Matricula = newVeterinarioDto.Matricula ?? string.Empty
            };

            //if(veterinarioModel.Matricula == newVeterinarioDto.Matricula)
            //{
            //    throw new Exception("La matrícula de este veterinario ya existe en el sistema.");

            //}
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(newVeterinarioDto.Password);
            veterinarioModel.Password = hashedPassword;
            await _userRepository.CreateUserAsync(veterinarioModel);

            return new DtoVeterinario(veterinarioModel);
        }


        // AUTENTICACIÓN (LOGIN)

        public async Task<DtoVeterinario> LoginAsync(DtoCredencialesLogin credentials)
        {
            // Busco el usuario (Veterinario) por el Email (Username)
            Veterinario userModel = await _userRepository.GetUserByUsernameAsync(credentials.Username);

            // 1. Verifico la existencia del usuario
            if (userModel == null)
            {
                throw new UnauthorizedAccessException("Credenciales de acceso inválidas.");
            }

            // 2. Verifico la contraseña
            // Usamos BCrypt.Verify para comparar el password plano con el hash almacenado
            bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(credentials.Password, userModel.Password);

            if (!isPasswordCorrect)
            {
                throw new UnauthorizedAccessException("Credenciales de acceso inválidas.");
            }

            // Credenciales válidas: Mapeo a DTO y lo devuelvo (sin password)
            DtoVeterinario loggedInUserDto = new DtoVeterinario(userModel);
            return loggedInUserDto;
        }
    }
}
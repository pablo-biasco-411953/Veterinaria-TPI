using BCrypt.Net;
using dogTor.Dtos;
using dogTor.Models;
using dogTor.Repository;
using dogTor.Services.Interfaces;
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

        public async Task<DtoCliente> RegisterUserAsync(DtoCliente newClientDto)
        {
            // Validamos que el usuario no esté registrado antes
            if (await _userRepository.GetUserByUsernameAsync(newClientDto.Dni.Value) != null)
            {
                throw new InvalidOperationException("El nombre de usuario ya está registrado.");
            }

            // Mapeo DTO a Model
            Cliente clienteModel = newClientDto.ConvertToModel();

            // Hasheo la Contraseña 
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(newClientDto.Password);
            clienteModel.Password = hashedPassword;

            await _userRepository.CreateUserAsync(clienteModel); 

            DtoCliente createdDto = new DtoCliente(clienteModel);
            createdDto.Password = null; 
            return createdDto;
        }

        public async Task<DtoCliente> LoginAsync(DtoCredencialesLogin credentials)
        {
            // Busco el usuario
            Cliente userModel = await _userRepository.GetUserByUsernameAsync(credentials.Username);

            // Verifico existencia y contraseña
            if (userModel == null)
            {
                throw new UnauthorizedAccessException("Credenciales de acceso inválidas.");
            }

            DtoCliente loggedInUserDto = new DtoCliente(userModel);
            loggedInUserDto.Password = null;
            return loggedInUserDto;
        }
    }
}
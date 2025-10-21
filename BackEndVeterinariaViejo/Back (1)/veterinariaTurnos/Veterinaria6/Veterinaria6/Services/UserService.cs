using Veterinaria6.Models;
using Veterinaria6.Repository;

namespace Veterinaria6.Services
{
    public class UserService : IUserService
    {
        private IUser _repository;
        public UserService(IUser repository)
        {
            _repository = repository;
        }
        public Task<bool> CreateUserAsync(Cliente cliente)
        {
            return _repository.CreateUserAsync(cliente);
        }

        public Task<Cliente> GetUserByUsernameAsync(string username)
        {
            return _repository.GetUserByUsernameAsync(username);
        }

        public bool IsValid(Cliente usuario)
        {
            return !string.IsNullOrEmpty(usuario.Username) &&
                !string.IsNullOrEmpty(usuario.Password) &&
                !string.IsNullOrEmpty(usuario.Nombre) &&                
                !string.IsNullOrEmpty(usuario.Telefono);
        }
    }
}

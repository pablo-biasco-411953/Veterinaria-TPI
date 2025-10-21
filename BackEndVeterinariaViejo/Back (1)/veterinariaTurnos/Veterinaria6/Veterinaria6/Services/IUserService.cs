using Veterinaria6.Models;

namespace Veterinaria6.Services
{
    public interface IUserService
    {
        Task<Cliente> GetUserByUsernameAsync(string username);
        Task<bool> CreateUserAsync(Cliente cliente);
        bool IsValid(Cliente usuario);
    }
}

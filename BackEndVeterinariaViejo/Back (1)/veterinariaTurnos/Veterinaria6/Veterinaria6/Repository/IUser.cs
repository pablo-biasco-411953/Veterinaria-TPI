using Veterinaria6.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Veterinaria6.Repository
{
    public interface IUser
    {
        Task<Cliente> GetUserByUsernameAsync(string username);
        Task<bool> CreateUserAsync(Cliente cliente);
    }
}

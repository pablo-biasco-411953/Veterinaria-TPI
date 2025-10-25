using dogTor.Models;

namespace dogTor.Repository
{
    public interface IUserRepository
    {
        Task<Cliente> GetUserByUsernameAsync(string username);

        Task<bool> CreateUserAsync(Cliente cliente);
    }
}
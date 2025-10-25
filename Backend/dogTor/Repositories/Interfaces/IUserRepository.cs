using dogTor.Models;

namespace dogTor.Repository
{
    public interface IUserRepository
    {
        Task<Cliente> GetUserByUsernameAsync(int username);

        Task<bool> CreateUserAsync(Cliente cliente);
    }
}
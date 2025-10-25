using dogTor.Models;
using System.Threading.Tasks;

namespace dogTor.Repository
{
    public interface IUserRepository
    {
        Task<Cliente> GetUserByUsernameAsync(string username);

        Task<bool> CreateUserAsync(Cliente cliente);
    }
}
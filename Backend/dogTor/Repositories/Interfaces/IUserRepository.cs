using dogTor.Models;
using System.Threading.Tasks;

namespace dogTor.Repository
{
    public interface IUserRepository
    {
        Task<Veterinario?> GetUserByUsernameAsync(string username);
        Task<bool> CreateUserAsync(Veterinario veterinario);
        Task<string?> GeneratePasswordResetTokenAsync(string email);
        Task<bool> ResetPasswordAsync(string token, string newPassword);
    }
}
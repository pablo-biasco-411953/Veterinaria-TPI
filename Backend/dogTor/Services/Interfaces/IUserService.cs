using dogTor.Dtos;
using System.Threading.Tasks;

namespace dogTor.Services.Interfaces
{
    public interface IUserService
    {
        Task<DtoVeterinario?> RegisterVeterinarioAsync(DtoVeterinario newVeterinarioDto);
        Task<DtoVeterinario> LoginAsync(DtoCredencialesLogin credentials);
        Task<(string Token, DtoVeterinario Usuario)?> ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(string token, string newPassword);

    }
}

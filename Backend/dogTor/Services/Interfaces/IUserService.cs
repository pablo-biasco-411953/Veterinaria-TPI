using dogTor.Dtos;
using System.Threading.Tasks;

namespace dogTor.Services.Interfaces
{
    public interface IUserService
    {
        Task<DtoVeterinario> RegisterVeterinarioAsync(DtoVeterinario newVeterinarioDto);
        Task<DtoVeterinario> LoginAsync(DtoCredencialesLogin credentials);
    }
}
using dogTor.Dtos;
using System.Threading.Tasks;

namespace dogTor.Services.Interfaces
{
    public interface IUserService
    {
        Task<DtoCliente> RegisterUserAsync(DtoCliente newClientDto);

        Task<DtoCliente> LoginAsync(DtoCredencialesLogin credentials);

    }
}
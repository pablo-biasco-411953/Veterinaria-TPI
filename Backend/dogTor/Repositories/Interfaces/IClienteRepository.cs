using dogTor.Dtos;
using dogTor.Models;
using dogTor.Models;

namespace dogTor.Repository
{
    public interface IClienteRepository
    {
        Task<List<DtoCliente>> GetAllAsync();
        Task<Cliente?> GetClienteByDNIAsync(int DNI);
        Task<bool> CreateClienteAsync(Cliente nuevoCliente);
    }
}

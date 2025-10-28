using dogTor.Dtos;
using dogTor.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dogTor.Services.Interfaces
{
    public interface IClienteService
    {
        Task<List<DtoCliente>> GetAllAsync();
        Task<List<DtoCliente>> GetClienteByDNIAsync(int DNI);
        Task<bool> CreateClienteAsync(DtoCliente nuevoCliente);
    }
}
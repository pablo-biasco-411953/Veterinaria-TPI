using dogTor.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dogTor.Services.Interfaces
{
    public interface IMascotaService
    {
        Task<List<DtoMascota>> GetAll();
        Task<DtoMascota> CreateMascotaAsync(DtoMascota newMascotaDto);
        Task<DtoMascota> GetMascotaByIdAsync(int mascotaId);
        Task<List<DtoTipoMascota>> GetTiposMascotaAsync();
        Task<List<DtoMascota>> GetMascotasByClienteIdAsync(int codCliente);
    }
}
using dogTor.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dogTor.Services.Interfaces
{
    public interface IAtencionService
    {
        Task<DtoAtencion> RegistrarAtencionAsync(DtoAtencion newAtencionDto);
        Task<List<DtoAtencion>> GetAllAtencionesAsync();
        Task<List<DtoDisponibilidad>> GetDisponibilidadFechaAsync();
        Task<List<DtoTipoAtencion>> GetTiposAtencionAsync();
    }
}
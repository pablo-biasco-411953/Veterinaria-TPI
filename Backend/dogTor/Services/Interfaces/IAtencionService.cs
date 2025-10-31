using dogTor.Dtos;
using dogTor.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dogTor.Services.Interfaces
{
    public interface IAtencionService
    {
        Task<DtoAtencion> RegistrarAtencionAsync(DtoAtencion newAtencionDto, int codDisponibilidad);
        Task<List<DtoAtencion>> GetAllAtencionesAsync();
        Task<List<DtoDisponibilidad>> GetDisponibilidadFechaAsync();
        Task<List<DtoTipoAtencion>> GetTiposAtencionAsync();
        Task<List<DtoAtencion>> GetAtencionesByClienteIdAsync(int clienteId);
        Task<List<DtoAtencion>> GetAtencionesByVeterinarioIdAsync(int veterinarioId);
        Task<List<DtoDisponibilidad>> GetDisponibilidadPorFechaAsync(DateTime fechaSolicitada);
        Task<DtoDisponibilidad> ActualizarEstadoDisponibilidadAsync(int codDisponibilidad, int nuevoEstado);
    }
}
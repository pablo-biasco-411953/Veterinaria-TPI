using dogTor.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using dogTor.Models;
using dogTor.Dtos;

namespace dogTor.Repository
{
    public interface IAtencionRepository
    {
        Task<List<Atencion>> GetAll();
        Task<Atencion?> GetByIdAsync(int id);
        Task<List<TipoAtencion>> GetTiposAtencion();
        Task<List<Disponibilidad>> GetDisponibilidadFecha();
        Task<List<Disponibilidad>> GetDisponibilidadHora();
        Task<List<Atencion>> GetByClienteId(int clienteId);
        Task<bool> Insert(Atencion atencion, int codDisponibilidad);
        Task Delete(int id);
        Task<List<Atencion>> GetByVeterinarioId(int veterinarioId);
        Task<List<Disponibilidad>> GetDisponibilidadFechaHora(DateTime fechaSolicitada);
        Task<TipoAtencion?> GetTipoAtencionPrecio(int codTipoA);
    }
}
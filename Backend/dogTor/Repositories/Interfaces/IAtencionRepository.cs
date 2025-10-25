using dogTor.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using dogTor.Models;

namespace dogTor.Repository
{
    public interface IAtencionRepository
    {
        Task<List<Atencion>> GetAll();
        Task<Atencion?> GetByIdAsync(int id);
        Task<List<TipoAtencion>> GetTiposAtencion();
        Task<List<Disponibilidad>> GetDisponibilidadFecha();
        Task<List<Disponibilidad>> GetDisponibilidadHora();
        Task<bool> Insert(Atencion atencion, int codDisponibilidad);
        Task Delete(int id);
    }
}
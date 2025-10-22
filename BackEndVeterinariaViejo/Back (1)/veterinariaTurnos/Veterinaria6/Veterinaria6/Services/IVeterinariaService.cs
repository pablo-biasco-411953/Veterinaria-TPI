using Veterinaria6.Models;

namespace Veterinaria6.Services
{
    public interface IVeterinariaService
    {
        Task<List<Atencion>> GetAll();
        Task<List<Atencion>> GetAllID(int id);
        Task<bool> Insert(Atencion atencion, int codDisponibilidad);
        Task Delete(int id);
        Task<List<dynamic>> GetTiposAtencion();
        Task<List<dynamic>> GetDisponibilidadFecha();
        Task<List<dynamic>> GetDisponibilidadHora();
    }
}

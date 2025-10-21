using Veterinaria6.Models;

namespace Veterinaria6.Repository
{
    public interface IVeterinariaRepository
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

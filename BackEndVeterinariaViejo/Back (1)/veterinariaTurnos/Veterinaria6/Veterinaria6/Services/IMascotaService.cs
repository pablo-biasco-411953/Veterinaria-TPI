using Veterinaria6.Models;

namespace Veterinaria6.Services
{
    public interface IMascotaService
    {
        Task<List<Mascotum>> GetAll(int userId);
        Task<Mascotum> GetById(int id);
        Task<bool> Update(Mascotum mascota, int id);
        Task<bool> Delete(int id);
        Task<bool> Create(Mascotum mascota);
        bool IsValid(Mascotum mascota);
        Task<List<TipoMascotum>> GetTipos();
    }
}

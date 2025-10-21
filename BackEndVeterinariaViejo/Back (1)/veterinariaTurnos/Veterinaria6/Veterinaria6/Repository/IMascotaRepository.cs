using Veterinaria6.Models;

namespace Veterinaria6.Repository
{
    public interface IMascotaRepository
    {
        Task<List<Mascotum>>GetAll(int userId);
        Task<Mascotum> GetById(int id);
        Task<bool> Update(Mascotum mascota, int id);
        Task<bool> Delete(int id);
        Task<bool> Create(Mascotum mascota);
        Task<List<TipoMascotum>> GetTipos();
        


    }
}

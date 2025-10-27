using dogTor.Models;
using dogTor.Models;

namespace dogTor.Repository
{
    public interface IMascotaRepository
    {
        Task<List<Mascotum>> GetAll();
        Task<Mascotum> GetByIdAsync(int id);
        Task<bool> Update(Mascotum mascota, int id);
        Task<bool> Delete(int id);
        Task<bool> Create(Mascotum mascota);
        Task<List<TipoMascotum>> GetTipos();
        Task<List<Mascotum>> GetByClienteId(int clienteId);


    }
}

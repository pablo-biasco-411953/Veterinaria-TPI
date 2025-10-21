using Veterinaria6.Models;
using Veterinaria6.Repository;

namespace Veterinaria6.Services
{
    public class MascotaService : IMascotaService
    {
        private IMascotaRepository _repository;
        public MascotaService(IMascotaRepository repository)
        {
            _repository = repository;
        }
        public async Task<bool> Create(Mascotum mascota)
        {
            return await _repository.Create(mascota);
        }

        public async Task<bool> Delete(int id)
        {
            return await _repository.Delete(id);
        }

        public async Task<List<Mascotum>> GetAll(int userId)
        {
            return await _repository.GetAll(userId);
        }

        public async Task<Mascotum> GetById(int id)
        {
            return await _repository.GetById(id);
        }

        public async Task<List<TipoMascotum>> GetTipos()
        {
            return await _repository.GetTipos();
        }

        public bool IsValid(Mascotum mascota)
        {
            return !string.IsNullOrEmpty(mascota.Nombre)    
                && mascota.CodTipo > 0;
        }

        public async Task<bool> Update(Mascotum mascota, int id)
        {
            return await _repository.Update(mascota, id);
        }
    }
}

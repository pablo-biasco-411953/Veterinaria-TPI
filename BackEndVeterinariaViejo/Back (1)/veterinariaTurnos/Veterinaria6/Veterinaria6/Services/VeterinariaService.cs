using Veterinaria6.Models;
using Veterinaria6.Repository;

namespace Veterinaria6.Services
{
    public class VeterinariaService : IVeterinariaService
    {
        private IVeterinariaRepository _repository;
        public VeterinariaService(IVeterinariaRepository repository)
        {
            _repository = repository;
        }
        public async Task<List<dynamic>> GetDisponibilidadFecha()
        {
            return await _repository.GetDisponibilidadFecha();

        }

        public async Task<List<dynamic>> GetDisponibilidadHora()
        {
            return await _repository.GetDisponibilidadHora();
        }

        public async Task<List<dynamic>> GetTiposAtencion()
        {
            return await _repository.GetTiposAtencion();
        }
        public Task Delete(int id)
        {
            return _repository.Delete(id);
        }

        public Task<List<Atencion>> GetAll()
        {
            return _repository.GetAll();
        }

        public Task<List<Atencion>> GetAllID(int id)
        {
            return _repository.GetAllID(id);
        }

        public Task<bool> Insert(Atencion atencion, int codDisponibilidad)
        {
            return _repository.Insert(atencion, codDisponibilidad);
        }
    }
}

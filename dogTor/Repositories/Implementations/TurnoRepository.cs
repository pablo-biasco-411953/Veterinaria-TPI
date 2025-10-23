using dogTor.Dtos;
using dogTor.Repositories.Interfaces;

namespace dogTor.Repositories.Implementations
{
    public class TurnoRepository : ITurnoRepository
    {
        public Task<bool> CreateTurnoAsync(DtoTurno turno)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteTurnoAync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<List<DtoTurno>> GetAll()
        {
            throw new NotImplementedException();
        }

        public Task<DtoTurno> GetByIdFecha(int id, DateTime fecha)
        {
            throw new NotImplementedException();
        }

        public Task<int> UpdateTurnoAsync(int id, DtoTurno turno)
        {
            throw new NotImplementedException();
        }
    }
}

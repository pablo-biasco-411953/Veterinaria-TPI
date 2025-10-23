using dogTor.Dtos;

namespace dogTor.Repositories.Interfaces
{
    public interface ITurnoRepository
    {
        Task<List<DtoTurno>> GetAll();

        Task<DtoTurno> GetByIdFecha(int id, DateTime fecha);

        Task<bool> CreateTurnoAsync(DtoTurno turno);

        Task<int> UpdateTurnoAsync(int id, DtoTurno turno);

        Task<bool> DeleteTurnoAync(int id);
    }
}

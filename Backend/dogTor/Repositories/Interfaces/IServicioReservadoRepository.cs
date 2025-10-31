using dogTor.Dtos;

namespace dogTor.Repositories.Interfaces
{
    public interface IServicioReservadoRepository
    {
        Task<List<DtoServicioReservado>> GetTopServicioReservadoList();
    }
}

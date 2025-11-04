using dogTor.Dtos;

namespace dogTor.Repositories.Interfaces
{
    public interface IServicioMasFacturadoRepository
    {
        // vemos si filtramos por fecha
        Task<List<DtoServicioMasFacturado>> GetAllAtencion(DateTime? fecMin, DateTime? fecMax);
    }
}

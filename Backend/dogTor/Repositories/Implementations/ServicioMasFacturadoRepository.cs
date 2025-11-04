using dogTor.Dtos;
using dogTor.Models;
using dogTor.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace dogTor.Repositories.Implementations
{
    public class ServicioMasFacturadoRepository : IServicioMasFacturadoRepository
    {
        private readonly veterinariaContext _context;

        public ServicioMasFacturadoRepository(veterinariaContext context)
        {
            _context = context;
        }
        public async Task<List<DtoServicioMasFacturado>> GetAllAtencion(DateTime? fecMin, DateTime? fecMax)
        {

            var query = await _context.Atencions
                    .Include(a => a.DetalleAtencions)
                    .Include(a => a.CodDisponibilidadNavigation)
                    .Include(a => a.CodTipoANavigation)
                    .Select(a => new DtoServicioMasFacturado
                    {
                        Facturado = Convert.ToDouble(a.Importe),
                        FechaFac = Convert.ToDateTime(a.CodDisponibilidadNavigation.Fecha),
                        Descripcion = Convert.ToString(a.CodTipoANavigation.Descripcion)

                    }).ToListAsync();
            return query;
        }
    }
}

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
            // 1. Definición del Rango de Fechas
            DateTime fechaFin = fecMax.HasValue ? fecMax.Value : DateTime.Now;
            DateTime fechaInicio = fecMin.HasValue ? fecMin.Value : fechaFin.AddDays(-7);

            var groupedQuery = await _context.Atencions
                .Include(a => a.CodDisponibilidadNavigation)

                // 2. FILTRO: Aplicar el filtro por rango de fechas Y por estado 3
                .Where(a => a.CodDisponibilidadNavigation.Fecha >= fechaInicio &&
                            a.CodDisponibilidadNavigation.Fecha <= fechaFin &&
                            a.CodDisponibilidadNavigation.CodEstado == 3) 

                .GroupBy(a => new
                {
                    Year = a.CodDisponibilidadNavigation.Fecha.Year,
                    WeekNum = (a.CodDisponibilidadNavigation.Fecha.DayOfYear / 7)
                })

                // 4. SELECCIÓN: Proyectar los resultados agregados
                .Select(g => new DtoServicioMasFacturado
                {
                    FechaFac = g.Min(a => a.CodDisponibilidadNavigation.Fecha),

                    // Sumamos todos los importes de ese grupo semanal
                    Facturado = g.Sum(a => (double?)a.Importe) ?? 0,

                    // Reemplazamos la descripción con un texto genérico, ya que la data es agregada
                    Descripcion = "Total Facturación Semanal"
                })
                .OrderBy(d => d.FechaFac)
                .ToListAsync();

            return groupedQuery;
        }
    }
}

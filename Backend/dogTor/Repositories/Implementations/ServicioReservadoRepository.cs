using dogTor.Dtos;
using dogTor.Models;
using dogTor.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace dogTor.Repositories.Implementations
{
    public class ServicioReservadoRepository : IServicioReservadoRepository
    {
        private readonly veterinariaContext _context;

        public ServicioReservadoRepository(veterinariaContext context)
        {
            _context = context;
        }

        public async Task<List<DtoServicioReservado>> GetTopServicioReservadoList(DateTime? fechaFiltro = null)
        {
            var query = _context.Atencions
                .Include(a => a.CodTipoANavigation)
                .Include(a => a.CodDisponibilidadNavigation)
                .AsQueryable();

            // Si viene un mes específico, filtramos por ese mes y año
            if (fechaFiltro.HasValue)
            {
                var mes = fechaFiltro.Value.Month;
                var anio = fechaFiltro.Value.Year;

                query = query.Where(a =>
                    a.CodDisponibilidadNavigation.Fecha.Month == mes &&
                    a.CodDisponibilidadNavigation.Fecha.Year == anio);
            }
            else
            {
                // Si no viene filtro, usamos últimos 6 meses como antes
                var fechaHoy = DateTime.Today;
                var fecha6Meses = fechaHoy.AddMonths(-6);
                query = query.Where(a =>
                    a.CodDisponibilidadNavigation.Fecha >= fecha6Meses &&
                    a.CodDisponibilidadNavigation.Fecha <= fechaHoy);
            }

            var topServicios = await query
                .GroupBy(a => new
                {
                    a.CodTipoA,
                    NombreServicio = a.CodTipoANavigation.Descripcion
                })
                .Select(g => new DtoServicioReservado
                {
                    CodTipoA = g.Key.CodTipoA,
                    NombreServicio = g.Key.NombreServicio,
                    TotalReservas = g.Count()
                })
                .OrderByDescending(r => r.TotalReservas)
                .Take(6)
                .ToListAsync();

            return topServicios;
        }
    }
}

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

        public async Task<List<DtoServicioReservado>> GetTopServicioReservadoList()
        {
            // Fecha de hoy y hace 6 meses
            var fechaHoy = DateTime.Today;
            var fecha6Meses = fechaHoy.AddMonths(-6);

            // Usamos el DbSet de Atencion. El CodTipoA define el servicio.
            var topServicios = await _context.Atencions
                .Include(a => a.CodTipoANavigation)
                .Include(a => a.CodDisponibilidadNavigation) // necesario para filtrar por fecha
                                                             // Filtramos solo los turnos de los últimos 6 meses
                .Where(a => a.CodDisponibilidadNavigation.Fecha >= fecha6Meses &&
                            a.CodDisponibilidadNavigation.Fecha <= fechaHoy)
                // Agrupamos por el ID del servicio y su nombre
                .GroupBy(a => new
                {
                    a.CodTipoA,
                    NombreServicio = a.CodTipoANavigation.Descripcion
                })
                // Proyectamos a DTO
                .Select(g => new DtoServicioReservado
                {
                    CodTipoA = g.Key.CodTipoA,
                    NombreServicio = g.Key.NombreServicio,
                    TotalReservas = g.Count()
                })
                // Orden descendente por total de reservas
                .OrderByDescending(r => r.TotalReservas)
                // Tomamos solo el Top 6
                .Take(6)
                .ToListAsync();

            return topServicios;
        }
    }
}


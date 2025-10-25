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
            // Usamos el DbSet de Atencion. El CodTipoA define el servicio.
            var topServicios = await _context.Atencions
                // El método Include es clave para que EF sepa cómo acceder al Nombre/Descripción del servicio.
                .Include(a => a.CodTipoANavigation)

                // 1. Agrupamos por el ID del servicio Y su descripción para contar cuántas veces aparece cada uno.
                // Agrupar por la descripción es crucial para que se incluya en el resultado.
                .GroupBy(a => new
                {
                    a.CodTipoA,
                    NombreServicio = a.CodTipoANavigation.Descripcion // Usamos la propiedad Description del modelo TipoAtencion
                })

                // 2. Proyectamos el resultado a nuestro DTO (o a un tipo anónimo intermedio)
                .Select(g => new DtoServicioReservado 
                {
                    CodTipoA = g.Key.CodTipoA,
                    NombreServicio = g.Key.NombreServicio,
                    TotalReservas = g.Count() // El total de atenciones en el grupo
                })

                // 3. Ordenamos de forma descendente (el más reservado primero)
                .OrderByDescending(r => r.TotalReservas)

                // 4. Aplicamos el límite del Top 6
                .Take(6)

                // 5. Ejecutamos la consulta y la convertimos a lista
                .ToListAsync();

            return topServicios;
        }
    }
    }


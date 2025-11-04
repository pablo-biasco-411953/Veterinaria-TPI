using dogTor.Dtos;
using dogTor.Models;
using dogTor.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dogTor.Repositories.Implementations
{
    public class VeterinariosConMasTurnosRepository : IVeterinarioConMasTurnos
    {
        private readonly veterinariaContext _context;

        public VeterinariosConMasTurnosRepository(veterinariaContext context)
        {
            _context = context;
        }

        public async Task<List<DtoVeterinarioTurnos>> GetTopVeterinariosByTurnosAsync(DateTime? fechaInicio, DateTime? fechaFin, int topN = 5)
        {
            var query = _context.Atencions
                .Include(a => a.CodVeterinarioNavigation)
                .Include(a => a.CodDisponibilidadNavigation)
                .Where(a => a.CodVeterinarioNavigation != null)
                .AsQueryable();

            if (fechaInicio.HasValue)
            {
                query = query.Where(a => a.CodDisponibilidadNavigation.Fecha.Date >= fechaInicio.Value.Date);
            }

            if (fechaFin.HasValue)
            {
      
                query = query.Where(a => a.CodDisponibilidadNavigation.Fecha.Date <= fechaFin.Value.Date);
            }

            var topVeterinarios = await query
                .GroupBy(a => a.CodVeterinarioNavigation)
                .Select(g => new DtoVeterinarioTurnos
                {
                    CodVeterinario = g.Key.CodVeterinario,
                    NombreCompleto = g.Key.Nombre + " " + g.Key.Apellido,
                    TotalTurnos = g.Count() 
                })
                .OrderByDescending(dto => dto.TotalTurnos)

                .Take(topN)

                .ToListAsync();

            return topVeterinarios;
        }
    }
}
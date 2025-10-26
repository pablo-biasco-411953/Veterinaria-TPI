using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using dogTor.Models;
using dogTor.Repository;

namespace Veterinaria6.Repository
{
    public class AtencionRepository : IAtencionRepository
    {
        private readonly veterinariaContext _context;

        public AtencionRepository(veterinariaContext context)
        {
            _context = context;
        }

        // GET: Solo disponibilidades libres
        public async Task<List<Disponibilidad>> GetDisponibilidadFecha()
        {
            return await _context.Disponibilidads
                .Where(d => d.Ocupada == 0)
                .ToListAsync();
        }

        // GET: Todas las disponibilidades
        public async Task<List<Disponibilidad>> GetDisponibilidadHora()
        {
            return await _context.Disponibilidads.ToListAsync();
        }

        // GET: Tipos de atención
        public async Task<List<TipoAtencion>> GetTiposAtencion()
        {
            return await _context.TipoAtencions.ToListAsync();
        }

        // DELETE: Borrar atención por ID
        public async Task Delete(int id)
        {
            var atencion = await _context.Atencions.FindAsync(id);

            if (atencion != null)
            {
                _context.Atencions.Remove(atencion);
                await _context.SaveChangesAsync();
            }
        }

        // GET: Todas las atenciones con relaciones
        public async Task<List<Atencion>> GetAll()
        {
            return await _context.Atencions
                .Include(a => a.CodMascotaNavigation)
                    .ThenInclude(m => m.CodClienteNavigation)
                .Include(a => a.CodTipoANavigation)
                .Include(a => a.CodDisponibilidadNavigation)
                .Include(a => a.DetalleAtencions)
                .ToListAsync();
        }

        // GET: Atención por ID
        public async Task<Atencion?> GetByIdAsync(int id)
        {
            return await _context.Atencions
                .Include(a => a.CodMascotaNavigation)
                    .ThenInclude(m => m.CodClienteNavigation)
                .Include(a => a.CodTipoANavigation)
                .Include(a => a.CodDisponibilidadNavigation)
                .FirstOrDefaultAsync(a => a.CodAtencion == id);
        }

        public async Task<List<Atencion>> GetByClienteId(int clienteId)
        {
            return await _context.Atencions
                .Include(a => a.CodMascotaNavigation)
                    .ThenInclude(m => m.CodClienteNavigation)
                .Include(a => a.CodTipoANavigation)
                .Include(a => a.CodDisponibilidadNavigation)
                .Include(a => a.DetalleAtencions)
                .Where(a => a.CodMascotaNavigation.CodClienteNavigation.CodCliente == clienteId)
                .ToListAsync();
        }

        // INSERT: Crear nueva atención y marcar disponibilidad
        public async Task<bool> Insert(Atencion atencion, int codDisponibilidad)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var disponibilidad = await _context.Disponibilidads
                    .FirstOrDefaultAsync(d => d.CodDisponibilidad == codDisponibilidad);

                if (disponibilidad == null || disponibilidad.Ocupada == 1)
                {
                    throw new InvalidOperationException("La disponibilidad seleccionada no existe o ya está reservada.");
                }

                disponibilidad.Ocupada = 1;
                _context.Disponibilidads.Update(disponibilidad);

                await _context.Atencions.AddAsync(atencion);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                return false;
            }
        }
    }
}

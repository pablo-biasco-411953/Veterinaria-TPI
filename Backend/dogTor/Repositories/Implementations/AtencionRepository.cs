using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using dogTor.Models;
using dogTor.Repository;
using dogTor.Dtos;

namespace Veterinaria6.Repository
{
    public class AtencionRepository : IAtencionRepository
    {
        private readonly veterinariaContext _context;

        public AtencionRepository(veterinariaContext context)
        {
            _context = context;
        }

        // GET: Solo disponibilidades libres (CORREGIDO)
        public async Task<List<Disponibilidad>> GetDisponibilidadFecha()
        {
            // Se asume que CodEstado = 1 es "Libre"

            return await _context.Disponibilidads
                .Where(d => d.CodEstado == 1)
                .Include(d => d.CodEstadoNavigation)
                .ToListAsync();
        }

        // GET: Todas las disponibilidades (NO CAMBIA)
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
                    .ThenInclude(d => d.CodEstadoNavigation) 
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

        // GET: Atención por VeterinarioId
        public async Task<List<Atencion>> GetByVeterinarioId(int veterinarioId)
        {
            return await _context.Atencions
                // 1. Filtrar por el código del veterinario
                .Where(a => a.CodVeterinario == veterinarioId)

                // 2. Incluir todas las navegaciones necesarias para el detalle del turno
                .Include(a => a.CodMascotaNavigation)
                    .ThenInclude(m => m.CodClienteNavigation) // Cliente del dueño
                .Include(a => a.CodTipoANavigation)           // Tipo de atención (Consulta, Vacuna)
                .Include(a => a.CodDisponibilidadNavigation)
                    .ThenInclude(d => d.CodEstadoNavigation)  // Estado del turno (Libre, Reservado)
                .Include(a => a.DetalleAtencions)             // Detalles de la atención

                // 3. Obtener el resultado
                .ToListAsync();
        }

        // GET: Atención por ClienteId
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

                // ❌ Antes: disponibilidad == null || disponibilidad.Ocupada == 1
                if (disponibilidad == null || disponibilidad.CodEstado != 1) // CORREGIDO: Verifica que el estado sea 'Libre'
                {
                    throw new InvalidOperationException("La disponibilidad seleccionada no existe o ya está reservada.");
                }

                // ❌ Antes: disponibilidad.Ocupada = 1
                disponibilidad.CodEstado = 2; // CORREGIDO: Marca el estado como 'Reservado'
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



        public async Task<List<Disponibilidad>> GetDisponibilidadFechaHora(DateTime fechaSolicitada)
        {
            // 💡 1. VALIDACIÓN DE NEGOCIO: La fecha no puede ser anterior al día de hoy.
            // Comparamos solo la parte de la fecha (Date) para ignorar la hora.
            if (fechaSolicitada.Date < DateTime.Today.Date)
            {
                throw new ArgumentException("No se pueden buscar horarios para fechas pasadas.");
            }

            // Código 1 = Libre
            const int ESTADO_LIBRE = 1;

            return await _context.Disponibilidads
                // 2. Filtra por la fecha solicitada
                .Where(d => d.Fecha.Date == fechaSolicitada.Date)
                // 3. Filtra por CodEstado = 1 (Libre)
                .Where(d => d.CodEstado == ESTADO_LIBRE)
                .Include(d => d.CodEstadoNavigation) // Asegura que el nombre del estado se cargue
                .ToListAsync();
        }
    }
}
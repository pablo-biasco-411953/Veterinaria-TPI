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
                // 💡 Incluir los Detalles es CRUCIAL para mostrar la info de precio
                .Include(a => a.DetalleAtencions)
                // Opcional: Si quieres los detalles de los Tipos de Atención de los Detalles (doble anidación)
                // .Include(a => a.DetalleAtencions).ThenInclude(d => d.CodTipoANavigation)
                .ToListAsync();
        }

        // GET: Precio por tipo de atencion
        public async Task<TipoAtencion?> GetTipoAtencionPrecio(int codTipoA)
        {
            // Buscamos el servicio por ID
            return await _context.TipoAtencions
                .FirstOrDefaultAsync(t => t.CodTipoA == codTipoA);
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
            // 💡 IMPORTANTE: LA LÓGICA DE CALCULAR EL IMPORTE TOTAL DEBE HACERSE AQUÍ

            // 1. Calcular el Importe Total (Suma de los detalles)
            // Asumimos que el modelo 'atencion' ya trae su colección 'DetalleAtencions'
            // donde cada detalle tiene Cantidad y PrecioUnitario llenos por el servicio.
            decimal totalImporte = atencion.DetalleAtencions.Sum(d => d.PrecioUnitario * d.Cantidad);

            // 2. Asignar el total a la cabecera
            atencion.Importe = totalImporte;

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var disponibilidad = await _context.Disponibilidads
                    .FirstOrDefaultAsync(d => d.CodDisponibilidad == codDisponibilidad);

                // Verifica que el estado sea 'Libre'
                if (disponibilidad == null || disponibilidad.CodEstado != 1)
                {
                    throw new InvalidOperationException("La disponibilidad seleccionada no existe o ya está reservada.");
                }

                // Marca el slot como 'Reservado'
                disponibilidad.CodEstado = 2;
                _context.Disponibilidads.Update(disponibilidad);

                // Asegura que la FK se vincule
                atencion.CodDisponibilidad = codDisponibilidad;

                // 3. Agrega la atención (que automáticamente incluye sus detalles si la colección no es null)
                await _context.Atencions.AddAsync(atencion);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (InvalidOperationException ex)
            {
                // Esto captura el error de lógica de negocio (ya reservado)
                await transaction.RollbackAsync();
                // Puedes relanzar la excepción para que la capa de servicio la maneje
                throw;
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
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
        private veterinariaContext _context;

        public AtencionRepository(veterinariaContext context)
        {
            _context = context;
        }

        public async Task<List<Disponibilidad>> GetDisponibilidadFecha()
        {
            // Devuelve solo las disponibilidades no ocupadas (Ocupada == 0)
            return await _context.Disponibilidads
                .Where(e => e.Ocupada == 0)
                // Se proyecta a la entidad completa para mantener la coherencia
                .ToListAsync();
        }

        public async Task<List<Disponibilidad>> GetDisponibilidadHora()
        {
            // Devuelve todas las disponibilidades
            return await _context.Disponibilidads.ToListAsync();
        }

        public async Task<List<TipoAtencion>> GetTiposAtencion()
        {
            return await _context.TipoAtencions.ToListAsync();
        }

        public async Task Delete(int id)
        {
            var atencion = await _context.Atencions.FindAsync(id);
            if (atencion != null)
            {
                _context.Atencions.Remove(atencion);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Atencion>> GetAll()
        {
            return await _context.Atencions.ToListAsync();
        }

        public async Task<List<Atencion>> GetAllID(int id)
        {
            return await _context.Atencions.Where(x => x.CodAtencion == id).ToListAsync();
        }

        public async Task<bool> Insert(Atencion atencion, int codDisponibilidad)
        {
            bool resultado = true;

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // 1. Buscar y verificar la disponibilidad de forma explícita
                    var disponibilidad = await _context.Disponibilidads
                        .FirstOrDefaultAsync(d => d.CodDisponibilidad == codDisponibilidad);

                    // Verificar si el slot de tiempo existe O si ya está ocupado (Ocupada = 1)
                    if (disponibilidad == null || disponibilidad.Ocupada == 1)
                    {
                        throw new InvalidOperationException("La disponibilidad seleccionada no existe o ya está reservada.");
                    }

                    // 2. Marcar disponibilidad como ocupada (1 = Ocupada)
                    disponibilidad.Ocupada = 1;
                    _context.Disponibilidads.Update(disponibilidad); 

                    // 3. Añadir la atención
                    await _context.Atencions.AddAsync(atencion);

                    // 4. Guardar los cambios (ambos: Atencion y Disponibilidad)
                    await _context.SaveChangesAsync();

                    // 5. Confirmar la transacción
                    await transaction.CommitAsync();
                }
                catch (InvalidOperationException ex)
                {
                    // Manejo específico de la validación de negocio
                    await transaction.RollbackAsync();
                    resultado = false;
                    throw ex; // Relanza la excepción para que la capa de Servicio la maneje
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    resultado = false;
                }
            }

            return resultado;
        }
    }
}
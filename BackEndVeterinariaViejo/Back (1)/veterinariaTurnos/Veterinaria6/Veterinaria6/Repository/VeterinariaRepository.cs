using Veterinaria6.Models;
using Microsoft.EntityFrameworkCore;

namespace Veterinaria6.Repository
{
    public class VeterinariaRepository : IVeterinariaRepository
    {
        private veterinariaBDContext _context;
        public VeterinariaRepository(veterinariaBDContext context)
        {
            _context = context;
        }

        public async Task<List<dynamic>> GetDisponibilidadFecha()
        {
            return await _context.Disponibilidads.Where(e=>e.Ocupada==0)
                .Select(d => new { d.CodDisponibilidad, d.Fecha })
                .ToListAsync<dynamic>();

        }

        public async Task<List<dynamic>> GetDisponibilidadHora()
        {
            return await _context.Disponibilidads
                  .Select(d => new { d.CodDisponibilidad, d.Hora })
                  .ToListAsync<dynamic>();
        }

        public async Task<List<dynamic>> GetTiposAtencion()
        {
            return await _context.TipoAtencions
                .Select(t => new { t.CodTipoA, t.Descripcion })
                .ToListAsync<dynamic>();
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
                    // Buscar la disponibilidad
                    var disponibilidad = await _context.Disponibilidads.FindAsync(codDisponibilidad);
                    if (disponibilidad == null )
                    {
                        throw new InvalidOperationException("La disponibilidad no está disponible.");
                    }

                    // Marcar disponibilidad como ocupada
                    disponibilidad.Ocupada = 1;

                    // Añadir la atención a la base de datos
                    await _context.Atencions.AddAsync(atencion);

                    // Guardar los cambios de la atención
                    //await _context.SaveChangesAsync();

                    // Asignar el ID de la atención a cada detalle
                    //foreach (var detalle in atencion.DetalleAtencions)
                    //{
                    //    detalle.CodAtencion = atencion.CodAtencion;  // Asocia el detalle con la atención
                    //    detalle.CodDetalle = 0;
                    //}

                    // Añadir los detalles de la atención a la base de datos
                   // await _context.DetalleAtencions.AddRangeAsync(atencion.DetalleAtencions);

                    // Guardar los cambios de los detalles
                    await _context.SaveChangesAsync();

                    // Confirmar la transacción
                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error: {ex.Message}");
                    Console.WriteLine($"StackTrace: {ex.StackTrace}");
                    // Si ocurre un error, revertir la transacción
                    await transaction.RollbackAsync();
                    resultado = false;
                }
            }

            return resultado;
        }


    }
}

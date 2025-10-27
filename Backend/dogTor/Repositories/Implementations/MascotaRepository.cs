using dogTor.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dogTor.Repository
{
    public class MascotaRepository : IMascotaRepository
    {
        private readonly veterinariaContext _context;

        public MascotaRepository(veterinariaContext context)
        {
            _context = context;
        }

        // CREATE: Agregar nueva mascota
        public async Task<bool> Create(Mascotum mascota)
        {
            mascota.Eliminado = false;

            await _context.Mascota.AddAsync(mascota);

            return await _context.SaveChangesAsync() > 0;
        }

        // DELETE: Eliminar mascota (marcar como eliminado)
        public async Task<bool> Delete(int id)
        {
            var mascotaActual = await GetByIdAsync(id);

            if (mascotaActual == null)
            {
                return false;
            }
            mascotaActual.Eliminado = true;

            return await _context.SaveChangesAsync() > 0;
        }

        // GET: Todas las mascotas (no eliminadas)
        public async Task<List<Mascotum>> GetAll()
        {
            return await _context.Mascota
                .Where(m => !m.Eliminado)
                .Include(m => m.CodTipoNavigation)
                .Include(m => m.CodClienteNavigation)
                .ToListAsync();
        }

        // GET: Mascota por ID
        public async Task<Mascotum?> GetByIdAsync(int id)
        {
            return await _context.Mascota.FindAsync(id);
        }

        // GET: Tipos de mascota
        public async Task<List<TipoMascotum>> GetTipos()
        {
            return await _context.TipoMascota.ToListAsync();
        }

        // UPDATE: Actualizar mascota existente
        public async Task<bool> Update(Mascotum mascotaActualizada, int id)
        {
            var mascotaExistente = await GetByIdAsync(id);

            if (mascotaExistente == null)
            {
                return false;
            }
            mascotaExistente.Nombre = mascotaActualizada.Nombre;
            mascotaExistente.CodCliente = mascotaActualizada.CodCliente;
            mascotaExistente.Edad = mascotaActualizada.Edad;
            mascotaExistente.CodTipo = mascotaActualizada.CodTipo;

            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<List<Mascotum>> GetByClienteId(int clienteDni)
        {
            return await _context.Mascota
          .Where(m => !m.Eliminado)
          .Where(m => m.CodClienteNavigation.Dni == clienteDni)
          .Include(m => m.CodTipoNavigation)
          .Include(m => m.CodClienteNavigation)
          .ToListAsync();
        }

    }

}

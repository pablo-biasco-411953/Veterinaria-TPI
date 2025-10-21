using Microsoft.EntityFrameworkCore;
using System.Reflection.PortableExecutable;
using Veterinaria6.Models;

namespace Veterinaria6.Repository
{
    public class MascotaRepository : IMascotaRepository
    {
        private veterinariaBDContext _context;
        public MascotaRepository(veterinariaBDContext context)
        {
            _context = context;
        }

        public async Task<bool> Create(Mascotum mascota)
        {
            await _context.Mascota.AddAsync(mascota);
            return await _context.SaveChangesAsync() == 1;
        }

        public async Task<bool> Delete(int id)
        {
            Mascotum found = await GetById(id);
            if (found != null)
            {
                found.Eliminado = true;
                return await _context.SaveChangesAsync() == 1;
            }
            return false;
        }

        public async Task<List<Mascotum>> GetAll(int userId)
        {
            return await _context.Mascota.Where(e=>!e.Eliminado && e.CodCliente==userId).ToListAsync();
        }

        public async Task<Mascotum> GetById(int id)
        {
            return await _context.Mascota.FindAsync(id);
        }

        public async Task<List<TipoMascotum>> GetTipos()
        {
            return await _context.TipoMascota.ToListAsync();
        }

        public async Task<bool> Update(Mascotum mascota, int id)
        {
            Mascotum found = await GetById(id);
            if (found != null)
            {
                found.Nombre = mascota.Nombre;
                found.CodCliente = mascota.CodCliente;
                found.Edad = mascota.Edad;
                found.CodTipo = mascota.CodTipo;                
                return await _context.SaveChangesAsync() == 1;
            }
            return false;
        }
    }
}

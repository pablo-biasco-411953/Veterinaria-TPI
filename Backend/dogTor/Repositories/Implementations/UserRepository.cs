using dogTor.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace dogTor.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly veterinariaContext _context;

        public UserRepository(veterinariaContext context)
        {
            _context = context;
        }

        // CREATE: Agregamos nuevo veterinario (User)
        public async Task<bool> CreateUserAsync(Veterinario nuevoVeterinario)
        {
            // ⚠️ Nota: El password debe estar hasheado ANTES de llamar a este método.
            await _context.Veterinario.AddAsync(nuevoVeterinario);
            return await _context.SaveChangesAsync() > 0;
        }

        // GET: Buscamos veterinario por username (Email)
        public async Task<Veterinario?> GetUserByUsernameAsync(string username)
        {
            // Ahora buscamos en la tabla 'Veterinario' usando el 'Email' como identificador
            var veterinarioBuscado = await _context.Veterinario
                .FirstOrDefaultAsync(v => v.Email == username);

            return veterinarioBuscado;
        }
    }
}
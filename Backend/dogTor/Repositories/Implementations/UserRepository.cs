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

        // CREATE: Agregamos nuevo cliente
        public async Task<bool> CreateUserAsync(Cliente nuevoCliente)
        {
            await _context.Clientes.AddAsync(nuevoCliente);
            return await _context.SaveChangesAsync() > 0;
        }

        // GET: Buscamos cliente por username
        public async Task<Cliente?> GetUserByUsernameAsync(int username)
        {
            var clienteBuscado = await _context.Clientes
                .FirstOrDefaultAsync(c => c.Dni == username);
            return clienteBuscado;
        }
    }
}

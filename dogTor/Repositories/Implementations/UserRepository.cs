using dogTor.Models;
using Microsoft.EntityFrameworkCore;

namespace dogTor.Repository
{
    public class UserRepository : IUserRepository
    {
        private veterinariaContext _context;
        public UserRepository(veterinariaContext context)
        {
            _context = context;
        }


        public async Task<bool> CreateUserAsync(Cliente clienteToCreate)
        {

            _context.Clientes.Add(clienteToCreate);

    
            return await _context.SaveChangesAsync() == 1;
        }

        public async Task<Cliente> GetUserByUsernameAsync(string username)
        {
            var user = await _context.Clientes.FirstOrDefaultAsync(u => u.Username == username);
            return user;
        }
    }
}

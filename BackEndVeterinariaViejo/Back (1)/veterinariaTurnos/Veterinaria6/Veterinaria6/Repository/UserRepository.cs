using Microsoft.EntityFrameworkCore;
using Veterinaria6.Models;
using BCrypt.Net;
namespace Veterinaria6.Repository
{
    public class UserRepository : IUser
    {
        private veterinariaBDContext _context;
        public UserRepository(veterinariaBDContext context)
        {
            _context = context;
        }
        public async Task<bool> CreateUserAsync(Cliente cliente)
        {
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(cliente.Password); // Hasheamos la contraseña
            var newUser = new Cliente
            {
                Nombre = cliente.Nombre,
                Apellido = cliente.Apellido,
                Telefono = cliente.Telefono,
                Username = cliente.Username,
                Dni = cliente.Dni,
                Password = hashedPassword
            };

            _context.Clientes.Add(newUser);
            return await _context.SaveChangesAsync() == 1;
        }

        public async Task<Cliente> GetUserByUsernameAsync(string username)
        {
            var user = await _context.Clientes.FirstOrDefaultAsync(u => u.Username == username);
            return user;
        }
    }
}

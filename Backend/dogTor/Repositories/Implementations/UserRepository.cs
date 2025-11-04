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
            bool matriculaExiste = await _context.Veterinario
        .AnyAsync(v => v.Matricula == nuevoVeterinario.Matricula);

            if (matriculaExiste)
                throw new InvalidOperationException("Ya existe un veterinario con esa matrícula.");

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
        public async Task<string?> GeneratePasswordResetTokenAsync(string email)
        {
            var user = await _context.Veterinario.FirstOrDefaultAsync(v => v.Email == email);
            if (user == null) return null;

            // Crear token seguro
            var token = Guid.NewGuid().ToString();

            user.ResetToken = token;
            user.ResetTokenExpiration = DateTime.UtcNow.AddHours(1); // una horita
            await _context.SaveChangesAsync();

            return token;
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(newPassword))
                return false;

            var user = await _context.Veterinario
                .FirstOrDefaultAsync(v => v.ResetToken == token);

            if (user == null) return false;

            // Verificar expiración
            if (!user.ResetTokenExpiration.HasValue || user.ResetTokenExpiration.Value < DateTime.UtcNow)
                return false;

            // Hashear la nueva contraseña con BCrypt
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);

            // Actualizar los campos del usuario
            user.Password = hashedPassword;
            user.ResetToken = null;
            user.ResetTokenExpiration = null;

            await _context.SaveChangesAsync();
            return true;
        }

    }

}
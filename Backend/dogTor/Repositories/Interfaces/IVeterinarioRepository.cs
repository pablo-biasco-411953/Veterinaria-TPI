using dogTor.Models;
using dogTor.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dogTor.Repository
{
    public interface IVeterinarioRepository
    {
        // 🛑 Método crucial para el LOGIN/AUTENTICACIÓN
        // Busca al veterinario por email y verifica la contraseña (la verificación del hash se hará en la implementación).
        Task<Veterinario?> Login(string email, string password);

        // Métodos de gestión (CRUD)
        Task<List<Veterinario>> GetAll();
        Task<Veterinario?> GetByIdAsync(int id);

        // Inserta un nuevo veterinario (necesitará hashear la contraseña en la implementación).
        Task<bool> Insert(Veterinario veterinario);

        // Actualiza los datos del veterinario.
        Task<bool> Update(Veterinario veterinario);

        // Elimina o desactiva el registro del veterinario.
        Task<bool> Delete(int id);
    }
}
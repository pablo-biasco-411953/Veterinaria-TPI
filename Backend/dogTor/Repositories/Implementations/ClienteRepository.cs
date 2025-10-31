using dogTor.Dtos;
using dogTor.Models;
using Microsoft.EntityFrameworkCore;

namespace dogTor.Repository
{
    public class ClienteRepository : IClienteRepository
    {
        private readonly veterinariaContext _context;

        public ClienteRepository(veterinariaContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateClienteAsync(Cliente nuevoCliente)
        {
            await _context.Clientes.AddAsync(nuevoCliente);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<List<DtoCliente>> GetAllAsync()
        {
            return await _context.Clientes
                .Select(c => new DtoCliente
                {
                    CodCliente = c.CodCliente,
                    Nombre = c.Nombre,
                    Apellido = c.Apellido,
                    Dni = c.Dni,
                    Telefono = c.Telefono,
                })
                .ToListAsync();
        }

        public async Task<Cliente?> GetClienteByDNIAsync(int DNI)
        {
            return await _context.Clientes.FirstOrDefaultAsync(c => c.Dni == DNI);
        }
    }
}

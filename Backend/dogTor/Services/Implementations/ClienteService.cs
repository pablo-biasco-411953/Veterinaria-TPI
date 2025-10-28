using dogTor.Dtos;
using dogTor.Models;
using dogTor.Repository;
using dogTor.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dogTor.Services.Implementations
{
    public class ClienteService : IClienteService
    {
        private readonly IClienteRepository _clienteRepository;

        public ClienteService(IClienteRepository clienteRepository)
        {
            _clienteRepository = clienteRepository;
        }

        // 🔹 Crear cliente nuevo
        public async Task<bool> CreateClienteAsync(DtoCliente nuevoCliente)
        {
            if (nuevoCliente == null)
                throw new ArgumentNullException(nameof(nuevoCliente));

            // Verificar si ya existe un cliente con ese DNI
            var clienteExistente = await _clienteRepository.GetClienteByDNIAsync(nuevoCliente.Dni ?? 0);
            if (clienteExistente != null)
                throw new Exception("Ya existe un cliente con este DNI.");

            // Convertimos el DTO al modelo
            var clienteModel = nuevoCliente.ConvertToModel();

            return await _clienteRepository.CreateClienteAsync(clienteModel);
        }

        // 🔹 Obtener todos los clientes
        public async Task<List<DtoCliente>> GetAllAsync()
        {
            return await _clienteRepository.GetAllAsync();
        }

        // 🔹 Obtener cliente por DNI
        public async Task<List<DtoCliente>> GetClienteByDNIAsync(int DNI)
        {
            var cliente = await _clienteRepository.GetClienteByDNIAsync(DNI);
            if (cliente == null)
                return new List<DtoCliente>();

            return new List<DtoCliente> { new DtoCliente(cliente) };
        }
    }
}

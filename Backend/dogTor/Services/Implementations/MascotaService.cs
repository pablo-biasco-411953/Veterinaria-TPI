using dogTor.Dtos;
using dogTor.Models;
using dogTor.Repository;
using dogTor.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dogTor.Services.Implementations
{
    public class MascotaService : IMascotaService
    {
        private readonly IMascotaRepository _mascotaRepository;

        public MascotaService(IMascotaRepository mascotaRepository)
        {
            _mascotaRepository = mascotaRepository;
        }

        public async Task<DtoMascota> CreateMascotaAsync(DtoMascota newMascotaDto)
        {
            // 1️⃣ Validación usando CodCliente directo
            if (newMascotaDto.CodCliente == null || newMascotaDto.CodCliente == 0)
            {
                throw new ArgumentException("Debe especificar el código del cliente (dueño) para registrar la mascota.");
            }

            // 2️⃣ Mapeo DTO -> Modelo
            Mascotum mascotaModel = newMascotaDto.ConvertToModel();

            // 3️⃣ Guardar en repo
            bool exito = await _mascotaRepository.Create(mascotaModel);
            if (!exito)
            {
                throw new Exception("Error al guardar la mascota en la base de datos.");
            }

            // 4️⃣ Devolver DTO con el CodMascota generado
            return new DtoMascota(mascotaModel);
        }


        public async Task<List<DtoMascota>> GetAll()
        {
            List<Mascotum> mascotasModel = await _mascotaRepository.GetAll();

            // 2. Mapeo Model -> DTO de la colección
            // Mapeamos la lista de Models a una lista de DTOs
            return mascotasModel
                .Select(m => new DtoMascota(m))
                .ToList();
        }

        public async Task<DtoMascota> GetMascotaByIdAsync(int mascotaId)
        {
            // 1. Acceso a Datos
            Mascotum mascotaModel = await _mascotaRepository.GetByIdAsync(mascotaId);

            if (mascotaModel == null)
            {
                throw new KeyNotFoundException($"Mascota con ID {mascotaId} no encontrada.");
            }

            // 2. Mapeo Model -> DTO
            return new DtoMascota(mascotaModel);
        }

        public async Task<List<DtoTipoMascota>> GetTiposMascotaAsync()
        {
            // 1. Acceso a Datos: Obtener catálogo de Models
            List<TipoMascotum> tiposModel = await _mascotaRepository.GetTipos();

            // 2. Mapeo Model -> DTO
            return tiposModel
                .Select(t => new DtoTipoMascota(t))
                .ToList();
        }
        public async Task<List<DtoMascota>> GetMascotasByClienteIdAsync(int clienteId)
        {
            List<Mascotum> mascotasModel = await _mascotaRepository.GetByClienteId(clienteId);

            if (mascotasModel == null)
            {
                return new List<DtoMascota>();
            }

            // 2. Mapeo Model -> DTO de la colección
            return mascotasModel
                .Select(m => new DtoMascota(m))
                .ToList();
        }
    }
}
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
            // 1. Validaciones 
            if (newMascotaDto.cliente?.CodCliente == null || newMascotaDto.cliente.CodCliente == 0)
            {
                throw new ArgumentException("Debe especificar el código del cliente (dueño) para registrar la mascota.");
            }

            // 2. Mapeo DTO -> Model
            Mascotum mascotaModel = newMascotaDto.ConvertToModel();

            bool exito = await _mascotaRepository.Create(mascotaModel);

            if (!exito)
            {
                throw new Exception("Error al guardar la mascota en la base de datos.");
            }

            // 4. Mapeo Model -> DTO para devolver el resultado con el CodMascota generado.
            // NOTA: Para este mapeo, necesitarás el constructor de salida DtoMascota(Mascotum model)
            return new DtoMascota(mascotaModel);
        }

        public async Task<List<DtoMascota>> GetAllByUserIdAsync(int userId)
        {
            // 1. Acceso a Datos: Obtener los Models por ID de usuario
            List<Mascotum> mascotasModel = await _mascotaRepository.GetAll(userId);

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
    }
}
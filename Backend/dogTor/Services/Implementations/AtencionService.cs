using dogTor.Dtos;
using dogTor.Models;
using dogTor.Services.Interfaces;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
using dogTor.Repository;
using Veterinaria6.Repository;

namespace dogTor.Services.Implementations
{
    // Asumo que tu repositorio de atenciones/turnos usa la interfaz IVeterinariaRepository
    // NOTA: Cambié IAtencionRepository por IVeterinariaRepository (asumiendo que tu repositorio general maneja Atenciones)
    public class AtencionService : IAtencionService
    {
        private readonly IAtencionRepository _repository;

        // Constructor: Inyección de Dependencias
        public AtencionService(IAtencionRepository repository)
        {
            _repository = repository;
        }

        public async Task<DtoAtencion> RegistrarAtencionAsync(DtoAtencion nuevaAtencionDto, int codDisponibilidad)
        {
            // 1. Validation
            if (codDisponibilidad <= 0)
            {
                throw new ArgumentException("Debe seleccionar un código de disponibilidad válido.");
            }

            // 2. Mapeo DTO -> Model
            Atencion atencionModel = nuevaAtencionDto.ConvertToModel();
            atencionModel.CodDisponibilidad = codDisponibilidad; // Assign the FK value

            // 3. Call Repository's Insert
            // The Repository handles the transaction and the state change (codDisponibilidad is the trigger).
            bool success = await _repository.Insert(atencionModel, codDisponibilidad);

            if (!success)
            {
                throw new Exception("Error desconocido al guardar la atención y reservar el turno.");
            }

            // 4. Return DTO
            return new DtoAtencion(atencionModel);
        }


        public async Task<List<DtoAtencion>> GetAllAtencionesAsync()
        {
            List<Atencion> atencionesModel = await _repository.GetAll();

            if (atencionesModel == null)
            {
                return new List<DtoAtencion>();
            }

            return atencionesModel
                .Select(a => new DtoAtencion(a))
                .ToList();
        }
        public async Task<List<DtoAtencion>> GetAtencionesByClienteIdAsync(int clienteId)
        {
            List<Atencion> atencionesModel = await _repository.GetByClienteId(clienteId);

            if (atencionesModel == null)
                return new List<DtoAtencion>();

            return atencionesModel.Select(a => new DtoAtencion(a)).ToList();
        }


        public async Task<List<DtoTipoAtencion>> GetTiposAtencionAsync()
        {
            List<TipoAtencion> tiposModel = await _repository.GetTiposAtencion();

            return tiposModel
                .Select(t => new DtoTipoAtencion(t))
                .ToList();
        }

        public async Task<List<DtoDisponibilidad>> GetDisponibilidadFechaAsync()
        {
            List<Disponibilidad> disponibilidadModel = await _repository.GetDisponibilidadFecha();

            return disponibilidadModel
                .Select(d => new DtoDisponibilidad(d))
                .ToList();
        }

        public Task<bool> Insert(Atencion atencion, int codDisponibilidad)
        {
            throw new NotImplementedException();
        }

        public async Task<List<DtoAtencion>> GetAtencionesByVeterinarioIdAsync(int veterinarioId)
        {
            var atencionModels = await _repository.GetByVeterinarioId(veterinarioId);

            if (atencionModels == null) return new List<DtoAtencion>();

            return atencionModels.Select(a => new DtoAtencion(a)).ToList();
        }

        public async Task<List<DtoDisponibilidad>> GetDisponibilidadPorFechaAsync(DateTime fechaSolicitada)
        {
            var disponibilidadModels = await _repository.GetDisponibilidadFechaHora(fechaSolicitada);

            if (disponibilidadModels == null) return new List<DtoDisponibilidad>();

            return disponibilidadModels.Select(d => new DtoDisponibilidad(d)).ToList();
        }
    }
}
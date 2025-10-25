using dogTor.Dtos;
using dogTor.Models;
using dogTor.Services.Interfaces;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
using dogTor.Repository;

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

        public async Task<DtoAtencion> RegistrarAtencionAsync(DtoAtencion nuevaAtencionDto)
        {
            // 1. Validaciones de Negocio (Filtro Rápido)
            // Asegura que el DTO tenga un ID de disponibilidad válido para evitar NullReferenceExceptions.
            if (nuevaAtencionDto.Disponibilidad?.CodDisponibilidad == null || nuevaAtencionDto.Disponibilidad.CodDisponibilidad <= 0)
            {
                throw new ArgumentException("Debe seleccionar un código de disponibilidad válido.");
            }

            // 2. Mapeo DTO -> Model
            Atencion atencionModel = nuevaAtencionDto.ConvertToModel();

            // 3. Obtener el Codigo de Disponibilidad para el repositorio (Ahora sabemos que no es null)
            int codDisponibilidad = nuevaAtencionDto.Disponibilidad.CodDisponibilidad;

            // 4. Guardar en la DB
            // El Repositorio maneja la transacción y la validación de ocupación (Ocupada == 0)
            bool success = await _repository.Insert(atencionModel, codDisponibilidad);

            if (!success)
            {
                // Este throw ocurrirá si el Repositorio devuelve false (tras un Rollback)
                throw new Exception("Error desconocido al guardar la atención y reservar el turno.");
            }

            // 5. Mapeo Model -> DTO para devolver el resultado (con el CodAtencion y las navegaciones actualizadas)
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
    }
}
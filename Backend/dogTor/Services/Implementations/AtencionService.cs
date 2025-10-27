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
            atencionModel.CodDisponibilidad = codDisponibilidad;

            // 💡 PASO CRÍTICO A AGREGAR: Llenar DetalleAtencions con Precio y Cantidad

            // 2a. Obtener el precio base del catálogo (Se asume un método de consulta en el Repositorio)
            // ⚠️ REQUERIMIENTO: Necesitas un método en el repositorio que busque el precio por CodTipoA.
            // Ejemplo (Asumimos que el repositorio tiene GetTipoAtencionPrecio(int codTipoA)):
            var tipoAtencion = await _repository.GetTipoAtencionPrecio(atencionModel.CodTipoA);
            decimal precioUnitario = tipoAtencion.PrecioBase;

            // TEMPORAL: Usamos un precio fijo/placeholder ya que la consulta real es compleja.

            // 2b. Crear y adjuntar el DetalleAtencion al modelo principal
            var detalle = new DetalleAtencion
            {
                CodTipoA = atencionModel.CodTipoA, // FK al tipo de servicio
                PrecioUnitario = precioUnitario,
                Cantidad = 1, // Asumimos una cantidad de 1 para la reserva inicial
                Observaciones = "Reserva de turno."
            };

            // Inicializar la colección y agregar el detalle (si no fue inicializada por ConvertToModel)
            if (atencionModel.DetalleAtencions == null)
            {
                atencionModel.DetalleAtencions = new List<DetalleAtencion>();
            }
            atencionModel.DetalleAtencions.Add(detalle);

            // 3. Call Repository's Insert
            // El Repositorio calculará el Importe Total usando esta colección.
            bool success = await _repository.Insert(atencionModel, codDisponibilidad);

            if (!success)
            {
                throw new Exception("Error desconocido al guardar la atención y reservar el turno.");
            }

            // 4. Return DTO
            // NOTA: Para que el DTO devuelto tenga los detalles cargados,
            // el Repositorio DEBE cargar el modelo con el detalle después del Insert (Post-select)
            // o el DTO debe crearse a partir de un objeto completo.
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
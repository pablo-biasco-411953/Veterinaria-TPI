using dogTor.Models;
using System.Collections.Generic;
using System.Linq;

namespace dogTor.Dtos
{
    public class DtoAtencion
    {
        // Properties used for both input (FKs) and output
        public int? CodAtencion { get; set; } // Only used for output/updates
        public int CodMascota { get; set; } // 💡 INPUT/FK
        public int CodTipoA { get; set; }   // 💡 INPUT/FK
        public int CodVeterinario { get; set; } // 💡 INPUT/FK (The current user)
        public double? Importe { get; set; }

        // Navigation properties used ONLY for output (from C# to JavaScript)
        public DtoDisponibilidad? DisponibilidadNavigation { get; set; } // Renamed for clarity
        public DtoTipoAtencion? TipoAtencionNavigation { get; set; }
        public DtoMascota? MascotaNavigation { get; set; }
        public ICollection<DtoDetalleAtencion>? Detalles { get; set; } = new List<DtoDetalleAtencion>();

        public DtoAtencion() { }

        // Constructor for OUTPUT (Model -> DTO)
        public DtoAtencion(Atencion atencionModel)
        {
            if (atencionModel == null) return;

            CodAtencion = atencionModel.CodAtencion;
            CodMascota = atencionModel.CodMascota;
            CodTipoA = atencionModel.CodTipoA;
            CodVeterinario = atencionModel.CodVeterinario ?? 0;
            Importe = atencionModel.Importe.HasValue ? (double)atencionModel.Importe.Value : null;

            // Mapping nested models to DTOs for client consumption
            DisponibilidadNavigation = atencionModel.CodDisponibilidadNavigation != null
                ? new DtoDisponibilidad(atencionModel.CodDisponibilidadNavigation)
                : null;

            TipoAtencionNavigation = atencionModel.CodTipoANavigation != null
                ? new DtoTipoAtencion(atencionModel.CodTipoANavigation)
                : null;

            MascotaNavigation = atencionModel.CodMascotaNavigation != null
                ? new DtoMascota(atencionModel.CodMascotaNavigation)
                : null;

            Detalles = atencionModel.DetalleAtencions
                .Select(d => new DtoDetalleAtencion(d))
                .ToList();
        }

        // Conversion for INPUT (DTO -> Model for DB save)
        public Atencion ConvertToModel()
        {
            return new Atencion
            {
                // Assigning FKs directly from DTO properties
                CodMascota = this.CodMascota,
                CodTipoA = this.CodTipoA,
                CodVeterinario = this.CodVeterinario,

                // CodDisponibilidad is assigned by the Service/Controller, NOT the DTO
                // CodDisponibilidad = ?, 

                Importe = this.Importe.HasValue ? (decimal)this.Importe.Value : null,

                // Assuming you don't send DetalleAtencions on simple registration:
                DetalleAtencions = new List<DetalleAtencion>()
            };
        }
    }
}
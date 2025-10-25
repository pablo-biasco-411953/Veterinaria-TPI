using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoAtencion
    {
        public int CodAtencion { get; set; }

        public DtoDisponibilidad Disponibilidad { get; set; }

        public DtoTipoAtencion Atencion { get; set; }
        public double? Importe { get; set; }
        public DtoMascota Mascota { get; set; }
        public ICollection<DtoDetalleAtencion> Detalles { get; set; } = new List<DtoDetalleAtencion>();

        public DtoAtencion() { }
        public DtoAtencion(Atencion atencionModel)
        {
            this.CodAtencion = atencionModel.CodAtencion;

            // Mapeo de propiedades simples
            this.Importe = atencionModel.Importe.HasValue ? (double)atencionModel.Importe.Value : null;

            // Mapeo de navegación. Ahora esto funciona porque DtoDisponibilidad, DtoTipoAtencion, 
            // y DtoMascota ya tienen sus constructores de 1 argumento.
            this.Disponibilidad = atencionModel.CodDisponibilidadNavigation != null ? new DtoDisponibilidad(atencionModel.CodDisponibilidadNavigation) : null;
            this.Atencion = atencionModel.CodTipoANavigation != null ? new DtoTipoAtencion(atencionModel.CodTipoANavigation) : null;
            this.Mascota = atencionModel.CodMascotaNavigation != null ? new DtoMascota(atencionModel.CodMascotaNavigation) : null;

            // Mapeo de la colección de detalles (Se asume que DtoDetalleAtencion tiene su constructor)
            this.Detalles = atencionModel.DetalleAtencions.Select(d => new DtoDetalleAtencion(d)).ToList();
        }
        public Atencion ConvertToModel()
        {
            Atencion atencionModel = new Atencion
            {
                CodDisponibilidad = this.Disponibilidad?.CodDisponibilidad ?? 0,
                CodTipoA = this.Atencion?.CodTipoA ?? 0,
                CodMascota = this.Mascota?.CodMascota ?? 0,
                Importe = this.Importe.HasValue ? (decimal)this.Importe.Value : null,

                DetalleAtencions = this.Detalles
                    .Select(d => d.ConvertToModel()) 
                    .ToList()
            };

            return atencionModel;
        }
    }

}

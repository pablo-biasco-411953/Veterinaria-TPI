using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoDetalleAtencion
    {
        public int? CodDetalle { get; set; }


        public int? CodAtencion { get; set; }

        public DtoTipoAtencion TipoAtencion { get; set; }

        public string? Observaciones { get; set; }


        public DtoDetalleAtencion() { }

        public DtoDetalleAtencion(DetalleAtencion Tdetalle)
        {
            this.CodDetalle = Tdetalle.CodDetalle;
            this.CodAtencion = Tdetalle.CodAtencion;
            this.Observaciones = Tdetalle.Observaciones;

            this.TipoAtencion = Tdetalle.CodTipoANavigation != null ? new DtoTipoAtencion(Tdetalle.CodTipoANavigation) : null;
        }

        public DetalleAtencion ConvertToModel()
        {
            DetalleAtencion detalleModel = new DetalleAtencion
            {
                CodDetalle = this.CodDetalle ?? 0,

                CodTipoA = this.TipoAtencion?.CodTipoA ?? 0,

                Observaciones = this.Observaciones ?? string.Empty
            };

            return detalleModel;
        }
    }
}
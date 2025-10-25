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

        public DtoDetalleAtencion(DetalleAtencion detalle)
        {
            CodDetalle = detalle.CodDetalle;
            CodAtencion = detalle.CodAtencion;
            Observaciones = detalle.Observaciones;

            if (detalle.CodTipoANavigation != null)
            {
                TipoAtencion = new DtoTipoAtencion(detalle.CodTipoANavigation);
            }
        }

        public DetalleAtencion ConvertToModel()
        {
            var detalleModel = new DetalleAtencion();

            detalleModel.CodDetalle = CodDetalle ?? 0;
            detalleModel.CodTipoA = TipoAtencion?.CodTipoA ?? 0;
            detalleModel.Observaciones = Observaciones ?? string.Empty;

            return detalleModel;
        }
    }
}

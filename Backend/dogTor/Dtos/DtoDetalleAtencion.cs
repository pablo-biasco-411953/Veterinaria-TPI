// DtoDetalleAtencion.cs (CORREGIDO)

using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoDetalleAtencion
    {
        public int? CodDetalle { get; set; }
        public int? CodAtencion { get; set; }
        public DtoTipoAtencion? TipoAtencion { get; set; } // Lo dejaremos anidado para output

        public double PrecioUnitario { get; set; } 
        public int Cantidad { get; set; }             

        public string? Observaciones { get; set; }

        public DtoDetalleAtencion() { }

        // Constructor para OUTPUT (Model -> DTO)
        public DtoDetalleAtencion(DetalleAtencion detalle)
        {
            CodDetalle = detalle.CodDetalle;
            CodAtencion = detalle.CodAtencion;
            Observaciones = detalle.Observaciones;
            PrecioUnitario = (double)detalle.PrecioUnitario; 
            Cantidad = detalle.Cantidad;                      

            if (detalle.CodTipoANavigation != null)
            {
                // Usamos el DTO del TipoAtencion para traer su descripción y precio base (si aplica)
                TipoAtencion = new DtoTipoAtencion(detalle.CodTipoANavigation);
            }
        }

        // Conversion para INPUT (DTO -> Model para DB save)
        public DetalleAtencion ConvertToModel()
        {
            var detalleModel = new DetalleAtencion();

            detalleModel.CodDetalle = CodDetalle ?? 0;
            detalleModel.CodAtencion = CodAtencion ?? 0; 
            detalleModel.CodTipoA = TipoAtencion?.CodTipoA ?? 0;
            detalleModel.PrecioUnitario = (decimal)PrecioUnitario; 
            detalleModel.Cantidad = Cantidad;                        
            detalleModel.Observaciones = Observaciones ?? string.Empty;

            return detalleModel;
        }
    }
}
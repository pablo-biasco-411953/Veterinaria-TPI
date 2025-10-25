using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoAtencion
    {
        public int CodAtencion { get; set; }
        public DtoDisponibilidad Disponibilidad { get; set; }
        public DtoTipoAtencion TipoAtencion { get; set; }
        public double? Importe { get; set; }
        public DtoMascota Mascota { get; set; }
        public ICollection<DtoDetalleAtencion> Detalles { get; set; } = new List<DtoDetalleAtencion>();

        public DtoAtencion() { }

        public DtoAtencion(Atencion atencionModel)
        {
            if (atencionModel == null)
            {
                return;
            }

            CodAtencion = atencionModel.CodAtencion;

            Importe = atencionModel.Importe.HasValue ? (double)atencionModel.Importe.Value : null;

            Disponibilidad = atencionModel.CodDisponibilidadNavigation != null
                ? new DtoDisponibilidad(atencionModel.CodDisponibilidadNavigation)
                : null;

            TipoAtencion = atencionModel.CodTipoANavigation != null
                ? new DtoTipoAtencion(atencionModel.CodTipoANavigation)
                : null;

            Mascota = atencionModel.CodMascotaNavigation != null
                ? new DtoMascota(atencionModel.CodMascotaNavigation)
                : null;

            Detalles = atencionModel.DetalleAtencions
                .Select(d => new DtoDetalleAtencion(d))
                .ToList();
        }

        public Atencion ConvertToModel()
        {
            return new Atencion
            {
                CodDisponibilidad = Disponibilidad?.CodDisponibilidad ?? 0,
                CodTipoA = TipoAtencion?.CodTipoA ?? 0,
                CodMascota = Mascota?.CodMascota ?? 0,
                Importe = Importe.HasValue ? (decimal)Importe.Value : null,
                DetalleAtencions = Detalles
                    .Select(d => d.ConvertToModel())
                    .ToList()
            };
        }
    }
}

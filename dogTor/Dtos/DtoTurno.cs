using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoTurno
    {
        public int CodAtencion { get; set; }

        public DtoDisponibilidad FechaDisponibilidad { get; set; }

        public DtoTipoAtencion Atencion { get; set; }

        public double Importe { get; set; }

        public DtoMascota Mascota { get; set; }

        public DtoTurno() { }

        public DtoTurno(Atencion turno)
        {
            this.CodAtencion = turno.CodAtencion;
            this.FechaDisponibilidad = new DtoDisponibilidad(turno.CodDisponibilidadNavigation);
            this.Atencion = new DtoTipoAtencion(turno.CodTipoANavigation);
            this.Importe = (double)turno.Importe;
            this.Mascota = new DtoMascota(turno.CodMascotaNavigation);
        }
    }
}

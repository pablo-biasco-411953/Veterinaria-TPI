using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoDisponibilidad
    {
        public int CodDisponibilidad { get; set; }

        public DateTime Fecha { get; set; }

        public TimeOnly Hora { get; set; }

        public bool Ocupado { get; set; }

        public DtoDisponibilidad() { }

        public DtoDisponibilidad(Disponibilidad Tdisponibilidad)
        {
            this.CodDisponibilidad = Tdisponibilidad.CodDisponibilidad;
            this.Fecha = Tdisponibilidad.Fecha;
            this.Hora = Tdisponibilidad.Hora;
            this.Ocupado = Convert.ToBoolean(Tdisponibilidad.Ocupada);
        }

    }
}

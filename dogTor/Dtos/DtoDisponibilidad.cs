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
            // Mapeamos el INT (0/1) del Model a BOOL (true/false) en el DTO
            this.Ocupado = Convert.ToBoolean(Tdisponibilidad.Ocupada);
        }
        public Disponibilidad ConvertToModel()
        {
            Disponibilidad disponibilidadModel = new Disponibilidad
            {
                // El CodDisponibilidad se asigna aquí solo si el objetivo es ACTUALIZAR
                // Si es para CREAR, se puede omitir o asignar 0 y la DB lo gestionará.
                CodDisponibilidad = this.CodDisponibilidad,

                Fecha = this.Fecha,
                Hora = this.Hora,

                // El Model usa 'int' (0 o 1) para representar el estado de ocupación, 
                // por lo que debemos convertir el 'bool' del DTO.
                Ocupada = Convert.ToInt32(this.Ocupado)
            };

            return disponibilidadModel;
        }

    }
}

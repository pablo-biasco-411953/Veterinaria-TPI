using dogTor.Models;
using System;
using dogTor.Dtos; 

namespace dogTor.Dtos
{
    public class DtoDisponibilidad
    {
        public int CodDisponibilidad { get; set; }
        public DateTime Fecha { get; set; }
        public TimeOnly Hora { get; set; }
        public DtoEstadoAtencion? Estado { get; set; }

        public DtoDisponibilidad(DtoDisponibilidad d) { }

        public DtoDisponibilidad(Disponibilidad model)
        {
            this.CodDisponibilidad = model.CodDisponibilidad;
            this.Fecha = model.Fecha;
            this.Hora = model.Hora;

            this.Estado = model.CodEstadoNavigation != null
                ? new DtoEstadoAtencion(model.CodEstadoNavigation)
                : null;
        }

        public Disponibilidad ConvertToModel()
        {
            Disponibilidad disponibilidadModel = new Disponibilidad
            {
                CodDisponibilidad = this.CodDisponibilidad,
                Fecha = this.Fecha,
                Hora = this.Hora,

                CodEstado = this.Estado?.CodEstado ?? 1 
            };

            return disponibilidadModel;
        }
    }
}
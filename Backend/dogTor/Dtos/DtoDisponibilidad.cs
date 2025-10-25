using dogTor.Models;
using System;

namespace dogTor.Dtos
{
    public class DtoDisponibilidad
    {
        public int CodDisponibilidad { get; set; }
        public DateTime Fecha { get; set; }
        public TimeOnly Hora { get; set; }
        public bool Ocupado { get; set; }

        public DtoDisponibilidad() { }

        public DtoDisponibilidad(Disponibilidad model)
        {
            CodDisponibilidad = model.CodDisponibilidad;
            Fecha = model.Fecha;
            Hora = model.Hora;
            Ocupado = model.Ocupada != 0; 
        }
        public Disponibilidad ConvertToModel()
        {
            Disponibilidad disponibilidadModel = new Disponibilidad();

            disponibilidadModel.CodDisponibilidad = this.CodDisponibilidad;
            disponibilidadModel.Fecha = this.Fecha;
            disponibilidadModel.Hora = this.Hora;

            if (this.Ocupado)
            {
                disponibilidadModel.Ocupada = 1;
            }
            else
            {
                disponibilidadModel.Ocupada = 0;
            }

            return disponibilidadModel;
        }
    }
}

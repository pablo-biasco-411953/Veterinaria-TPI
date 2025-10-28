using dogTor.Models;
using System;

namespace dogTor.Dtos
{
    public class DtoMascota
    {
        public int? CodMascota { get; set; }
        public string? Nombre { get; set; }
        public int? Edad { get; set; }
        public int? CodCliente { get; set; }
        public DtoCliente? Cliente { get; set; }
        public int? CodTipo { get; set; }

        public DtoTipoMascota? Tipo { get; set; }
        public bool Activo { get; set; } = true;

        public DtoMascota() { }

        // Constructor para mapear desde modelo
        public DtoMascota(Mascotum mascota)
        {
            CodMascota = mascota.CodMascota;
            Nombre = mascota.Nombre;
            Edad = mascota.Edad;
            CodCliente = mascota.CodCliente;
            Cliente = mascota.CodClienteNavigation != null ? new DtoCliente(mascota.CodClienteNavigation) : null;
            Tipo = mascota.CodTipoNavigation != null ? new DtoTipoMascota(mascota.CodTipoNavigation) : null;
            Activo = !mascota.Eliminado;
        }

        // Convertir DTO a modelo
        public Mascotum ConvertToModel()
        {
            if (CodCliente == null || CodCliente == 0)
                throw new ArgumentException("Debe especificar el código del cliente (dueño) para registrar la mascota.");

            if (CodTipo == null || CodTipo == 0)
                throw new ArgumentException("Debe especificar el tipo de mascota.");

            return new Mascotum
            {
                CodMascota = CodMascota ?? 0,
                Nombre = Nombre ?? string.Empty,
                Edad = Edad ?? 0,
                CodCliente = CodCliente.Value,
                CodTipo = CodTipo.Value,
                Eliminado = !Activo
            };
        }

    }
}

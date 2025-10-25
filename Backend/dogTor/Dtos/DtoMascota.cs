using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoMascota
    {
        public int? CodMascota { get; set; }

        public string? Nombre { get; set; }

        public int? edad { get; set; }

        public DtoCliente? cliente { get; set; }

        public DtoTipoMascota? Tipo { get; set; }
        public bool Activo { get; set; } = true;

        public DtoMascota() { }
        public DtoMascota(Mascotum Tmascota)
        {
            this.CodMascota = Tmascota.CodMascota;
            this.Nombre = Tmascota.Nombre;
            this.edad = Tmascota.Edad;
            this.cliente = Tmascota.CodClienteNavigation != null ? new DtoCliente(Tmascota.CodClienteNavigation) : null;
            this.Tipo = Tmascota.CodTipoNavigation != null ? new DtoTipoMascota(Tmascota.CodTipoNavigation) : null;
            this.Activo = !Tmascota.Eliminado;
        }

        public Mascotum ConvertToModel()
        {
            Mascotum mascotaModel = new Mascotum
            {
                CodMascota = this.CodMascota ?? 0,
                Nombre = this.Nombre ?? string.Empty,
                Edad = this.edad ?? 0,
                CodCliente = this.cliente?.CodCliente ?? 0,
                CodTipo = this.Tipo?.CodTipoMascota ?? 0,
                Eliminado = !this.Activo
            };
            if (this.CodMascota == null || this.CodMascota == 0)
            {
                mascotaModel.Eliminado = false;
            }
            return mascotaModel;
        }
    }
}
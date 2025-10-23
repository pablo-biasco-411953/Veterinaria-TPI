using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoMascota
    {
        public int? CodMascota {  get; set; }

        public string? Nombre { get; set; }

        public int? edad { get; set; }

        public DtoCliente? cliente { get; set; }

        public DtoTipoMascota? Tipo {  get; set; }

        public bool Activo { get; set; } = false;

        public DtoMascota() { }

        public DtoMascota(Mascotum Tmascota)
        {
            this.CodMascota = Tmascota.CodMascota;
            this.Nombre = Tmascota.Nombre;
            this.edad = Tmascota.Edad;
            this.cliente = new DtoCliente(Tmascota.CodClienteNavigation);
            this.Tipo = new DtoTipoMascota(Tmascota.CodTipoNavigation);
            this.Activo = Tmascota.Eliminado;
        }
    }
}

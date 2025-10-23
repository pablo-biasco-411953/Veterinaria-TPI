using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoTipoMascota
    {
        public int CodTipoMascota { get; set; }

        public string Nombre { get; set; }

        DtoTipoMascota() { }

        public DtoTipoMascota(TipoMascotum Tmascota)
        {
            this.CodTipoMascota = Tmascota.CodTipo;
            this.Nombre = Tmascota.Nombre;
        }
    }

}

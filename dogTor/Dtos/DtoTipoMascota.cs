using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoTipoMascota
    {
        public int CodTipoMascota { get; set; }

        public string Nombre { get; set; }
        public DtoTipoMascota() { }


        public DtoTipoMascota(TipoMascotum Tmascota)
        {
            this.CodTipoMascota = Tmascota.CodTipo;
            this.Nombre = Tmascota.Nombre;
        }
        public TipoMascotum ConvertToModel()
        {
            TipoMascotum tipoMascotaModel = new TipoMascotum
            {
                CodTipo = this.CodTipoMascota,

                Nombre = this.Nombre ?? string.Empty
            };

            return tipoMascotaModel;
        }
    }
}
using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoTipoMascota
    {
        public int CodTipoMascota { get; set; }

        public string Nombre { get; set; }

        public DtoTipoMascota() { }

        public DtoTipoMascota(TipoMascotum mascota)
        {
            CodTipoMascota = mascota.CodTipo;
            Nombre = mascota.Nombre;
        }

        // Convierto el DTO a modelo
        public TipoMascotum ConvertToModel()
        {
            return new TipoMascotum
            {
                CodTipo = CodTipoMascota,
                Nombre = Nombre ?? string.Empty
            };
        }
    }
}

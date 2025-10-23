using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoTipoAtencion
    {
        public int CodigoAtencion { get; set; }
        public string Atencion { get; set; }

        public DtoTipoAtencion() { }

        public DtoTipoAtencion(TipoAtencion atencion)
        {
            this.CodigoAtencion = atencion.CodTipoA;
            this.Atencion = atencion.Descripcion;
        }
    }
}

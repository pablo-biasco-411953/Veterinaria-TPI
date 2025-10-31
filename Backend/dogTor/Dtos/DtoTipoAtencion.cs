using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoTipoAtencion
    {
        public int CodTipoA { get; set; }
        public string Atencion { get; set; }
        public double PrecioBase { get; set; }
        public DtoTipoAtencion() { }

        public DtoTipoAtencion(TipoAtencion atencion)
        {
            this.CodTipoA = atencion.CodTipoA;
            this.Atencion = atencion.Descripcion;
            this.PrecioBase = (double)atencion.PrecioBase; 
        }
    }
}

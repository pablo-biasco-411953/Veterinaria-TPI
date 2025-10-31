using dogTor.Models;

namespace dogTor.Dtos
{
    public class DtoEstadoAtencion
    {
        public int? CodEstado { get; set; }

        public string? Nombre { get; set; }

        public DtoEstadoAtencion() { }

        public DtoEstadoAtencion(EstadoAtencion estadoModel)
        {
            this.CodEstado = estadoModel.CodEstado;
            this.Nombre = estadoModel.Nombre;
        }
        public EstadoAtencion ConvertToModel()
        {
            return new EstadoAtencion
            {
                CodEstado = this.CodEstado ?? 0,
                Nombre = this.Nombre ?? string.Empty
            };
        }
    }
}
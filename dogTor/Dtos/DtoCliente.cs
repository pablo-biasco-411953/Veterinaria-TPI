using dogTor.Models;
using Microsoft.AspNetCore.Mvc;

namespace dogTor.Dtos
{
    public class DtoCliente
    {
        public int? CodCliente { get; set; }

        public string? Nombre { get; set; }

        public int? Telefono { get; set; }

        public int? Dni { get; set; }

        public DtoCliente() { }

        public DtoCliente(Cliente Tcliente)
        {
            this.CodCliente = Tcliente?.CodCliente;
            this.Nombre = Tcliente?.Nombre;
            this.Telefono = Tcliente?.Telefono == null ? Convert.ToInt32(Tcliente?.Telefono):0 ;
            this.Dni = Tcliente?.Dni ?? 0;
        }
    }
}

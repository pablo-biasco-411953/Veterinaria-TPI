using dogTor.Models;
using System;

namespace dogTor.Dtos
{
    public class DtoCliente
    {
        public int? CodCliente { get; set; }
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string? Telefono { get; set; }
        public int? Dni { get; set; }

        public DtoCliente() { }

        public DtoCliente(Cliente Tcliente)
        {
            CodCliente = Tcliente.CodCliente;
            Nombre = Tcliente.Nombre;
            Apellido = Tcliente.Apellido;
            Telefono = Tcliente.Telefono;
            Dni = Tcliente.Dni;
        }

        public Cliente ConvertToModel()
        {

            var clienteModel = new Cliente
            {
                CodCliente = CodCliente ?? 0,
                Dni = Dni ?? 0,
                Nombre = Nombre ?? string.Empty,
                Apellido = Apellido ?? string.Empty,
                Telefono = Telefono ?? string.Empty,
            };

            if (clienteModel.Dni == 0)
            {
                throw new ArgumentException("El DNI del cliente no puede ser 0 o nulo.");
            }

            return clienteModel;
        }
    }
}

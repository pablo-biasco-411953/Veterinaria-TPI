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
        public string? Dni { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }

        public DtoCliente() { }

        public DtoCliente(Cliente Tcliente)
        {
            CodCliente = Tcliente.CodCliente;
            Nombre = Tcliente.Nombre;
            Apellido = Tcliente.Apellido;
            Telefono = Tcliente.Telefono;
            Dni = Tcliente.Dni.ToString();
            Username = Tcliente.Username;
            Password = null; 
        }

        public Cliente ConvertToModel()
        {
            int dniNumerico = 0;

            if (!string.IsNullOrEmpty(Dni))
            {
                int.TryParse(Dni, out dniNumerico);
            }

            var clienteModel = new Cliente
            {
                CodCliente = CodCliente ?? 0,
                Dni = dniNumerico,
                Nombre = Nombre ?? string.Empty,
                Apellido = Apellido ?? string.Empty,
                Telefono = Telefono ?? string.Empty,
                Username = Username ?? string.Empty,
                Password = Password
            };

            if (clienteModel.Dni == 0)
            {
                throw new ArgumentException("El DNI del cliente no puede ser 0 o nulo.");
            }

            return clienteModel;
        }
    }
}

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

        // -------------------------------------------------------------------
        // ¡SOLUCIÓN! AGREGAR ESTE CONSTRUCTOR VACÍO Y PÚBLICO
        // El deserializador de JSON lo usará para crear el objeto a partir del JSON.
        // -------------------------------------------------------------------
        public DtoCliente() { }

        // Constructor de Mapeo de Salida (Model -> DTO)
        // Se mantiene para que tu capa Service pueda crear DTOs de salida.
        public DtoCliente(Cliente Tcliente)
        {
            this.CodCliente = Tcliente.CodCliente;
            this.Nombre = Tcliente.Nombre;
            this.Apellido = Tcliente.Apellido;
            this.Telefono = Tcliente.Telefono;
            this.Dni = Tcliente.Dni.ToString();
            this.Username = Tcliente.Username;
            this.Password = null;
        }

        // Método de Conversión de Entrada (DTO -> Model)
        public Cliente ConvertToModel()
        {
            int dniNumerico = 0;
            if (!string.IsNullOrEmpty(this.Dni))
            {
                int.TryParse(this.Dni, out dniNumerico);
            }

            Cliente clienteModel = new Cliente
            {
                CodCliente = this.CodCliente ?? 0,
                Dni = dniNumerico,
                Nombre = this.Nombre ?? string.Empty,
                Apellido = this.Apellido ?? string.Empty,
                Telefono = this.Telefono ?? string.Empty,
                Username = this.Username ?? string.Empty,
                Password = this.Password 
            };

            return clienteModel;
        }
    }
}
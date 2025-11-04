using dogTor.Models;

namespace dogTor.Dtos
{
    // DTO para representar los datos públicos del Veterinario
    public class DtoVeterinario
    {
        public int? CodVeterinario { get; set; }
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string? Matricula { get; set; }
        public string? Email { get; set; }
        public string Password { get; set; } = null;
        public bool IsAdmin { get; set; }

        public DtoVeterinario() { }

        public DtoVeterinario(Veterinario veterinarioModel)
        {
            this.CodVeterinario = veterinarioModel.CodVeterinario;
            this.Nombre = veterinarioModel.Nombre;
            this.Apellido = veterinarioModel.Apellido;
            this.Matricula = veterinarioModel.Matricula;
            this.Email = veterinarioModel.Email;
            this.Password = veterinarioModel.Password;
            this.IsAdmin = veterinarioModel.IsAdmin;
        }


        public Veterinario ConvertToModel()
        {
            return new Veterinario
            {
                CodVeterinario = this.CodVeterinario ?? 0,
                Nombre = this.Nombre ?? string.Empty,
                Apellido = this.Apellido ?? string.Empty,
                Matricula = this.Matricula ?? string.Empty,
                Email = this.Email ?? string.Empty,
                IsAdmin = this.IsAdmin
            };
        }
    }
}

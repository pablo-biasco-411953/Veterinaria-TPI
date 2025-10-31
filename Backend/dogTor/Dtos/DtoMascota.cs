using dogTor.Dtos;
using dogTor.Models;

public class DtoMascota
{
    public int? CodMascota { get; set; }
    public string? Nombre { get; set; }
    public int? Edad { get; set; }
    public int? CodCliente { get; set; }
    public DtoCliente? Cliente { get; set; }
    public int? CodTipo { get; set; }
    public DtoTipoMascota? Tipo { get; set; }
    public bool Activo { get; set; } = true;

    // 🔹 Nueva propiedad para la imagen
    public string? ImagenMascota { get; set; }

    public DtoMascota() { }

    public DtoMascota(Mascotum mascota)
    {
        CodMascota = mascota.CodMascota;
        Nombre = mascota.Nombre;
        Edad = mascota.Edad;
        CodCliente = mascota.CodCliente;
        Cliente = mascota.CodClienteNavigation != null ? new DtoCliente(mascota.CodClienteNavigation) : null;
        Tipo = mascota.CodTipoNavigation != null ? new DtoTipoMascota(mascota.CodTipoNavigation) : null;
        Activo = !mascota.Eliminado;
        ImagenMascota = mascota.ImagenMascota; // 👈 acá se mapea
    }

    public Mascotum ConvertToModel()
    {
        if (CodCliente == null || CodCliente == 0)
            throw new ArgumentException("Debe especificar el código del cliente (dueño) para registrar la mascota.");

        if (CodTipo == null || CodTipo == 0)
            throw new ArgumentException("Debe especificar el tipo de mascota.");

        return new Mascotum
        {
            CodMascota = CodMascota ?? 0,
            Nombre = Nombre ?? string.Empty,
            Edad = Edad ?? 0,
            CodCliente = CodCliente.Value,
            CodTipo = CodTipo.Value,
            Eliminado = !Activo,
            ImagenMascota = ImagenMascota // 👈 guardar base64
        };
    }
}

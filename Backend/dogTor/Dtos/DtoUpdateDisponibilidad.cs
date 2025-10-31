namespace dogTor.Dtos
{
    public class DtoUpdateDisponibilidad
    {
        public int CodDisponibilidad { get; set; }
        public int NuevoEstado { get; set; } // 1=Libre, 2=Reservado, 3=Finalizado, 4=Cancelado
    }
}

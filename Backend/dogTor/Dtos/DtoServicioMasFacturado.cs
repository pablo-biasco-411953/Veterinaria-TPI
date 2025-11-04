namespace dogTor.Dtos
{
    public class DtoServicioMasFacturado
    {
        public double Facturado { get; set; }
        public DateTime FechaFac { get; set; }
        public string Descripcion { get; set; }
        public int CantAtencion { get; set; }

        public DtoServicioMasFacturado() { }
    }
}

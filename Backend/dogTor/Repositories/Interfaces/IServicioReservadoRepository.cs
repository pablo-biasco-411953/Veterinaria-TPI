using dogTor.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dogTor.Repositories.Interfaces
{
    public interface IServicioReservadoRepository
    {
        Task<List<DtoServicioReservado>> GetTopServicioReservadoList(DateTime? fechaFiltro = null);
    }
}

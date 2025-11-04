using dogTor.Dtos;
using System; 
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dogTor.Repositories.Interfaces
{
    public interface IVeterinarioConMasTurnos
    {
        Task<List<DtoVeterinarioTurnos>> GetTopVeterinariosByTurnosAsync(DateTime? fechaInicio, DateTime? fechaFin, int topN = 5);
    }
}
import { getAtencionByClienteId, getMascotaByClienteId } from './api.js'; // <-- necesitas este endpoint en tu API

document.addEventListener('DOMContentLoaded', async () => {
    const userRaw = sessionStorage.getItem('dogtorUser');
    if (!userRaw) {
        alert('No hay sesión iniciada. Volviendo al login.');
        window.location.href = '../Pages/login.html';
        return;
    }

    const user = JSON.parse(userRaw);
    const userId = user.id || user.id_cliente;

    try {
        // Obtener todos los turnos del cliente
        const res = await getAtencionByClienteId(userId);
        if (!res.ok) throw new Error('Error al obtener turnos del cliente');
        const turnosCliente = await res.json();

        renderTurnos(turnosCliente);
        document.getElementById('totalTurnos').textContent = `${turnosCliente.length} turnos encontrados`;
    } catch (err) {
        console.error(err);
        const tbody = document.getElementById('tablaTurnos');
        if (tbody) {
            tbody.innerHTML = `
                <tr><td colspan="6" class="text-center text-danger">Error cargando los turnos</td></tr>`;
        }
    }
});

// === Renderizar tabla ===
function renderTurnos(lista) {
    const tbody = document.getElementById('tablaTurnos');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-secondary">No se encontraron turnos.</td></tr>`;
        return;
    }

    lista.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatFecha(t.disponibilidad?.fecha)}</td>
            <td>${t.disponibilidad?.hora?.substring(0,5) || '-'}</td>
            <td>${t.mascota?.nombre || '-'}</td>
            <td>${t.mascota?.cliente ? t.mascota.cliente.nombre + ' ' + t.mascota.cliente.apellido : '-'}</td>
            <td>${t.tipoAtencion?.atencion || '-'}</td>
            <td><span class="badge bg-${colorEstado(t.disponibilidad?.ocupado ? 'ocupado' : 'pendiente')}">
                ${t.disponibilidad?.ocupado ? 'Ocupado' : 'Pendiente'}
            </span></td>
        `;
        tbody.appendChild(tr);
    });
}




// === Helpers ===
function formatFecha(fecha) {
    const f = new Date(fecha);
    return f.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function colorEstado(estado) {
    switch (estado) {
        case 'pendiente': return 'warning';
        case 'confirmado': return 'info';
        case 'atendido': return 'success';
        case 'cancelado': return 'danger';
        default: return 'secondary';
    }
}

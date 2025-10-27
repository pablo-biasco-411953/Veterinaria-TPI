// app.js
import { 
    getMascotaByClienteId, getTiposMascota, getAllAtenciones, getTiposAtencion, 
    getDisponibilidadFecha, getTurnosDisponibles,getProximasAtenciones
} from './api.js';

// ===== Variables globales =====
let Mascota = [];
let Tipo_Atencion = [];
let Disponibilidad = [];
let Turno = [];
let TipoMascota = [];  // Tipos de mascota desde la API

const hoy = new Date();
const yyyy_mm_dd = hoy.toISOString().slice(0, 10);

// ===== Helpers DOM =====
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ===== Helpers de datos =====
function nombreCliente(id) {
    const m = Mascota.find(x => x.id_mascota === id);
    if (!m || !m.cliente) return '—';
    return `${m.cliente.nombre} ${m.cliente.apellido}`;
}

function nombreMascota(id) {
    const m = Mascota.find(x => x.id_mascota === id);
    return m ? m.nombre : '—';
}

function nombreAtencion(id) {
    const t = Tipo_Atencion.find(x => x.id_tipo_atencion === id);
    return t ? t.nombre : '—';
}

function precioAtencion(id) {
    const t = Tipo_Atencion.find(x => x.id_tipo_atencion === id);
    return t ? t.precio : 0;
}

function renderFiltroTipoMascota() {
    const cont = document.getElementById('filtroTipoMascota');
    if (!cont) return;

    cont.innerHTML = '';

    // Botón "Todos"
    const btnTodos = document.createElement('button');
    btnTodos.className = 'btn btn-outline-info active';
    btnTodos.textContent = 'Todos';
    btnTodos.dataset.tipo = '';
    cont.appendChild(btnTodos);

    // Botones dinámicos por cada tipo
    TipoMascota.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-info';
        btn.textContent = t.nombre;          // Nombre del tipo
        btn.dataset.tipo = t.codTipoMascota; // Código del tipo
        cont.appendChild(btn);
    });

    // Eventos de filtrado
    cont.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
            // Activar botón seleccionado
            cont.querySelectorAll('button').forEach(x => x.classList.remove('active'));
            b.classList.add('active');

            filtrarMascotas(b.dataset.tipo);
        });
    });
}

function filtrarMascotas(tipoId) {
    const tarjetas = document.querySelectorAll('.card-mascota');
    tarjetas.forEach(t => {
        if (!tipoId || t.dataset.tipo === tipoId) {
            t.style.display = '';
        } else {
            t.style.display = 'none';
        }
    });
}

async function cargarTiposMascota() {
    try {
        const res = await getTiposMascota(); 
        TipoMascota = await res.json();
        renderFiltroTipoMascota();
    } catch (err) {
        console.error("Error cargando tipos de mascota:", err);
        TipoMascota = [];
    }
}

function renderMascotas() {
    const grid = document.getElementById('gridMascotas');
    if (!grid) return;

    grid.innerHTML = ''; // limpiar grid antes de agregar

    Mascotas.forEach(m => {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 card-mascota';
        col.dataset.tipo = m.tipo?.codTipoMascota || ''; // clave para filtrar

        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${m.nombre}</h5>
                    <p class="card-text">Tipo: ${m.tipo?.nombre || '—'}</p>
                    <p class="card-text">Edad: ${m.edad}</p>
                    <p class="card-text small text-secondary">Cliente: ${m.cliente?.nombre} ${m.cliente?.apellido}</p>
                </div>
            </div>
        `;

        grid.appendChild(col);
    });

    // actualizar contador de mascotas visibles
    document.getElementById('count').textContent = Mascotas.length;
}

// ===== Perfil usuario =====
function setUserBadgeFromSession() {
    const badge = $('#avatar') || $('#btnPerfil');
    if (!badge) return;

    const raw = sessionStorage.getItem('dogtorUser');
    let initials = 'US';
    if (raw) {
        try {
            const u = JSON.parse(raw);
            const email = (u.email || '').trim();
            if (email) {
                const namePart = email.split('@')[0];
                const parts = namePart.split(/[._-]+/).filter(Boolean);
                if (parts.length === 1) initials = parts[0].slice(0, 2);
                else initials = (parts[0][0] || '') + (parts[1][0] || '');
            }
        } catch { }
    }
    badge.textContent = initials.toUpperCase();
}

// ===== KPIs =====
async function renderKPIs() {
    const raw = sessionStorage.getItem('dogtorUser');
    if (!raw) return;
    const user = JSON.parse(raw);
    const userId = user.id;

    // 🐶 Total de mascotas del cliente
    const kpiPacientes = $('#kpiPacientes');
    if (kpiPacientes) kpiPacientes.textContent = Mascota.length.toString();

    // 📅 Total de turnos del cliente (independiente de la fecha)
    const turnosCliente = Turno.filter(t => t.id_cliente === userId);
    $('#kpiTurnosHoy').textContent = turnosCliente.length.toString();

    // 🕒 Cantidad de turnos libres globales (traídos desde la API)
    try {
        const res = await getTurnosDisponibles();
        if (res.ok) {
            const turnos = await res.json();
            const libres = turnos.filter(t => !t.ocupado).length;
            $('#kpiDisponibles').textContent = libres.toString();
        } else {
            $('#kpiDisponibles').textContent = '0';
        }
    } catch (err) {
        console.error('Error cargando turnos libres:', err);
        $('#kpiDisponibles').textContent = '0';
    }

    // 💰 Facturación simulada (puede ser 0 si el backend no lo da)
    const total = turnosCliente.reduce((acc, t) => acc + precioAtencion(t.id_tipo_atencion), 0);
    $('#kpiFacturacion').textContent = '$ ' + new Intl.NumberFormat('es-AR').format(total);
}
// ===== Gráfico de turnos =====
function monthKey(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

function lastNMonths(n = 6) {
    const now = new Date();
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const base = d.toLocaleString('es-AR', { month: 'short' });
        const label = (d.getFullYear() !== now.getFullYear()) ? `${base} ${d.getFullYear()}` : base;
        out.push({ key, label });
    }
    return out;
}

let chartTurnosInstance = null;

function renderChart() {
    const canvas = $('#chartTurnos');
    if (!canvas || typeof Chart === 'undefined') return;

    if (chartTurnosInstance) {
        chartTurnosInstance.destroy();
        chartTurnosInstance = null;
    }

    const months = lastNMonths(6);
    const labels = months.map(m => m.label);
    const buckets = Object.fromEntries(months.map(m => [m.key, { pendiente: 0, confirmado: 0, atendido: 0 }]));

    Turno.forEach(t => {
        if (!t.fecha) return;
        const key = monthKey(t.fecha);
        if (buckets[key]) {
            const e = (t.estado || '').toLowerCase();
            if (e === 'pendiente') buckets[key].pendiente++;
            else if (e === 'confirmado') buckets[key].confirmado++;
            else if (e === 'atendido') buckets[key].atendido++;
        }
    });

    const dataPend = months.map(m => buckets[m.key].pendiente);
    const dataConf = months.map(m => buckets[m.key].confirmado);
    const dataAtnd = months.map(m => buckets[m.key].atendido);

    const totalSpan = $('#chartTotal');

    const css = getComputedStyle(document.documentElement);
    const cPend = css.getPropertyValue('--pendiente').trim() || '#FFC107';
    const cConf = css.getPropertyValue('--confirmado').trim() || '#0DCAF0';
    const cAtnd = css.getPropertyValue('--atendido').trim() || '#198754';

    chartTurnosInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Pendiente', data: dataPend, backgroundColor: cPend },
                { label: 'Confirmado', data: dataConf, backgroundColor: cConf },
                { label: 'Atendido', data: dataAtnd, backgroundColor: cAtnd }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: '#BFD4EA' } },
                tooltip: {
                    callbacks: {
                        title: items => `Mes ${items[0].label}`,
                        footer: items => {
                            const i = items[0].dataIndex;
                            const tot = dataPend[i] + dataConf[i] + dataAtnd[i];
                            return `Total: ${tot}`;
                        }
                    }
                }
            },
            scales: {
                x: { stacked: true, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#9CB2CC' } },
                y: { stacked: true, beginAtZero: true, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#9CB2CC', precision: 0, stepSize: 1 } }
            },
            onHover: (evt, elements) => {
                if (!totalSpan) return;
                if (elements?.length) {
                    const i = elements[0].index;
                    const tot = dataPend[i] + dataConf[i] + dataAtnd[i];
                    totalSpan.textContent = `Total mensual: ${tot}`;
                } else {
                    const last = dataPend.length - 1;
                    const tot = dataPend[last] + dataConf[last] + dataAtnd[last];
                    totalSpan.textContent = `Total mensual: ${tot}`;
                }
            }
        }
    });

    if (totalSpan) {
        const last = dataPend.length - 1;
        const tot = dataPend[last] + dataConf[last] + dataAtnd[last];
        totalSpan.textContent = `Total mensual: ${tot}`;
    }
}

// ===== Próximos turnos =====
function badgeEstado(estado) {
    switch (estado) {
        case 'confirmado': return 'text-bg-info';
        case 'pendiente': return 'text-bg-warning';
        case 'prioridad': return 'text-bg-danger';
        case 'atendido': return 'text-bg-success';
        default: return 'text-bg-secondary';
    }
}

function renderProximos() {
    const cont = $('#listaProximos');
    cont.innerHTML = '';

    if (!Turno.length) {
        cont.innerHTML = '<div class="list-group-item text-center text-secondary">No hay próximos turnos</div>';
        return;
    }

    const prox = Turno
        .filter(t => t.fecha >= yyyy_mm_dd)
        .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
        .slice(0, 5);

    prox.forEach(t => {
        const li = document.createElement('a');
        li.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <div>
                <div class="fw-semibold">${t.nombreMascota} — ${t.nombreAtencion}</div>
                <small class="text-secondary">${t.fecha} ${t.hora} • ${t.nombreCliente}</small>
            </div>
            <span class="badge rounded-pill ${badgeEstado(t.estado)}">${t.estado}</span>
        `;
        cont.appendChild(li);
    });
}
// ===== Tabla Disponibilidad =====
function renderDisponibilidad() {
    const tbody = $('#tablaDisponibilidad');
    tbody.innerHTML = '';

    const horasTomadas = new Map(Turno.filter(t => t.fecha === yyyy_mm_dd).map(t => [t.hora, t]));
    Disponibilidad
        .filter(d => d.fecha === yyyy_mm_dd)
        .sort((a, b) => a.hora_desde.localeCompare(b.hora_desde))
        .forEach(d => {
            const turno = horasTomadas.get(d.hora_desde);
            const estado = turno ? turno.estado : d.estado;
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${d.hora_desde}–${d.hora_hasta}</td>
        <td><span class="badge rounded-pill ${badgeEstado(estado)}">${turno ? 'ocupado' : 'libre'}</span></td>
        <td>${turno ? nombreAtencion(turno.id_tipo_atencion) : '—'}</td>
        <td>${turno ? nombreMascota(turno.id_mascota) : '—'}</td>
        <td>${turno ? nombreCliente(turno.id_cliente) : '—'}</td>
      `;
            tbody.appendChild(tr);
        });
}

// ===== Inicialización =====
async function cargarDatos(userId) {
    await Promise.all([
        cargarMascotas(userId),
        cargarTiposAtencion(),
        cargarTurnosDisponibles(),
        cargarTurnosProximos(userId)
    ]);
}

async function initClientes() {
    const raw = sessionStorage.getItem('dogtorUser');
    if (!raw) { window.location.href = './index.html'; return; }

    const user = JSON.parse(raw);
    await Promise.all([
        cargarTiposMascota(),
        cargarMascotas(user.id)
    ]);
}

document.addEventListener('DOMContentLoaded', initClientes);

async function initDashboard() {
    const raw = sessionStorage.getItem('dogtorUser');
    console.log("data sin tratar: ", raw)
    if (!raw) { window.location.href = '../Html/index.html'; return; }
    const user = JSON.parse(raw);
    console.log("datos user: ",user)
    await cargarDatos(user.id);

    setUserBadgeFromSession();
    renderKPIs();
    renderChart();
    renderProximos();
    renderDisponibilidad();
    renderMascotas();
    setupPerfilMenu();
}

// ===== Cargar datos API =====
async function cargarMascotas(userId) {
    try {
        console.log("eluid: ",userId)
        const res = await getMascotaByClienteId(userId); 
        if (!res.ok) throw new Error('Error al cargar mascotas');
        Mascota = await res.json();
    } catch (err) {
        console.error(err);
        Mascota = [];
    }
}

async function cargarTiposAtencion() {
    try {
        const res = await getTiposAtencion();
        if (!res.ok) throw new Error('Error al cargar tipos de atención');
        Tipo_Atencion = await res.json();
    } catch (err) {
        console.error(err);
        Tipo_Atencion = [];
    }
}

async function cargarDisponibilidad() {
    try {
        const res = await getDisponibilidadFecha();
        if (!res.ok) throw new Error('Error al cargar disponibilidad');
        Disponibilidad = await res.json();
    } catch (err) {
        console.error(err);
        Disponibilidad = [];
    }
}

async function cargarTurnosDisponibles() {
    const tabla = document.getElementById('tablaDisponibilidad');
    if (!tabla) return console.error("No se encontró el tbody con id 'tablaDisponibilidad'");

    try {
        const res = await getTurnosDisponibles();
        if (!res.ok) throw new Error(`Error ${res.status}`);

        const turnos = await res.json();
        tabla.innerHTML = ''; // limpiar tabla

        if (!turnos || !turnos.length) {
            tabla.innerHTML = '<tr><td colspan="4" class="text-center">No hay turnos disponibles</td></tr>';
            return;
        }

        turnos.forEach(t => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${new Date(t.fecha).toLocaleDateString('es-AR')}</td>
                <td>${t.hora}</td>
                <td><span class="badge rounded-pill ${t.ocupado ? 'text-bg-danger' : 'text-bg-success'}">
                    ${t.ocupado ? 'Ocupado' : 'Libre'}
                </span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" ${t.ocupado ? 'disabled' : ''} data-turno-id="${t.id || ''}">
                        Tomar turno
                    </button>
                </td>
            `;

            // Evento del botón
            tr.querySelector('button')?.addEventListener('click', () => {
                console.log('Tomando turno id:', t.id);
                // Aquí llamás a la API para reservar el turno
                // tomarTurno(t.id);
            });

            tabla.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        tabla.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar los turnos</td></tr>';
    }
}


document.addEventListener('DOMContentLoaded', cargarTurnosDisponibles);

// Llamar la función al iniciar
cargarTurnosDisponibles();

async function cargarTurnosProximos(userId) {
    try {
        console.log("Cargando próximas atenciones para usuario:", userId);
        const res = await getProximasAtenciones(userId);
        if (!res.ok) throw new Error(`Error al cargar turnos del cliente (status ${res.status})`);

        const data = await res.json();
        console.log("Turnos del cliente:", data);

        // Adaptar formato al que usa el dashboard
        Turno = data.map(t => ({
            id: t.codAtencion,
            fecha: t.disponibilidad?.fecha?.split('T')[0] || '',
            hora: t.disponibilidad?.hora?.substring(0, 5) || '',
            estado: 'pendiente',
            id_mascota: t.mascota?.codMascota || null,
            id_cliente: t.mascota?.cliente?.codCliente || null,
            id_tipo_atencion: t.tipoAtencion?.codTipoA || null,
            nombreMascota: t.mascota?.nombre || '—',
            nombreAtencion: t.tipoAtencion?.atencion || '—',
            nombreCliente: t.mascota?.cliente
                ? `${t.mascota.cliente.nombre} ${t.mascota.cliente.apellido}`
                : '—'
        }));

        console.log("Turno adaptado:", Turno);
    } catch (err) {
        console.error("Error en cargarTurnosProximos:", err);
        Turno = [];
    }
}

// ===== Perfil menu =====
function setupPerfilMenu() {
    const btn = $('#btnPerfil');
    const menu = $('#menuPerfil');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => menu.classList.toggle('show'));
    document.addEventListener('click', e => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) menu.classList.remove('show');
    });

    const logout = $('#btnLogout');
    if (logout) logout.addEventListener('click', () => {
        sessionStorage.removeItem('dogtorUser');
        window.location.href = '../Html/index.html';
    });
}

// ===== Arranque =====
initDashboard();

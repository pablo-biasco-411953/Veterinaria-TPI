// ===== mascotas prueba=====
const Tipo_Mascota = [
    { id_tipo_mascota: 1, nombre: 'Canina' },
    { id_tipo_mascota: 2, nombre: 'Felina' },
];

const Tipo_Atencion = [
    { id_tipo_atencion: 1, nombre: 'Vacunación', duracion_min: 20, precio: 12000 },
    { id_tipo_atencion: 2, nombre: 'Control general', duracion_min: 30, precio: 15000 },
    { id_tipo_atencion: 3, nombre: 'Radiografía', duracion_min: 40, precio: 25000 },
];

const Cliente = [
    { id_cliente: 1, nombre: 'Ana', apellido: 'Gómez', email: 'ana@mail.com', telefono: '11-5555-5555' },
    { id_cliente: 2, nombre: 'Carlos', apellido: 'López', email: 'carlos@mail.com', telefono: '11-4444-4444' },
];

const Mascota = [
    { id_mascota: 1, id_cliente: 1, id_tipo_mascota: 1, nombre: 'Luna', raza: 'Mestizo', sexo: 'H' },
    { id_mascota: 2, id_cliente: 2, id_tipo_mascota: 1, nombre: 'Rocky', raza: 'Labrador', sexo: 'M' },
    { id_mascota: 3, id_cliente: 2, id_tipo_mascota: 2, nombre: 'Mila', raza: 'Siames', sexo: 'H' },
];

// Disponibilidad
const hoy = new Date();
const yyyy_mm_dd = hoy.toISOString().slice(0, 10);
const Disponibilidad = [
    { id_disponibilidad: 1, fecha: yyyy_mm_dd, hora_desde: '09:00', hora_hasta: '09:30', estado: 'disponible' },
    { id_disponibilidad: 2, fecha: yyyy_mm_dd, hora_desde: '09:30', hora_hasta: '10:00', estado: 'disponible' },
    { id_disponibilidad: 3, fecha: yyyy_mm_dd, hora_desde: '10:00', hora_hasta: '10:30', estado: 'disponible' },
    { id_disponibilidad: 4, fecha: yyyy_mm_dd, hora_desde: '10:30', hora_hasta: '11:00', estado: 'disponible' },
    { id_disponibilidad: 5, fecha: yyyy_mm_dd, hora_desde: '11:00', hora_hasta: '11:30', estado: 'disponible' },
    { id_disponibilidad: 6, fecha: yyyy_mm_dd, hora_desde: '11:30', hora_hasta: '12:00', estado: 'disponible' },
];

// Turnos de ejemplo
const Turno = [
    { id_turno: 1, id_mascota: 1, id_cliente: 1, id_tipo_atencion: 1, fecha: yyyy_mm_dd, hora: '10:00', estado: 'confirmado' },
    { id_turno: 2, id_mascota: 2, id_cliente: 2, id_tipo_atencion: 2, fecha: yyyy_mm_dd, hora: '12:00', estado: 'pendiente' },
    // históricos 'atendido' del mes (para facturación mock)
    { id_turno: 3, id_mascota: 3, id_cliente: 2, id_tipo_atencion: 3, fecha: yyyy_mm_dd.slice(0, 7) + '-05', hora: '09:00', estado: 'atendido' },
    { id_turno: 4, id_mascota: 1, id_cliente: 1, id_tipo_atencion: 1, fecha: yyyy_mm_dd.slice(0, 7) + '-10', hora: '11:00', estado: 'atendido' },
];

// ===== Helpers =====
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ===== Helpers datos =====
function nombreCliente(id) {
    const c = Cliente.find(x => x.id_cliente === id);
    return c ? `${c.nombre} ${c.apellido}` : '—';
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

//perfil usuario (iniciales)
function setUserBadgeFromSession() {
    const badge = $('#avatar');
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
function renderKPIs() {
    $('#kpiPacientes').textContent = Mascota.length.toString();

    const turnosHoy = Turno.filter(t => t.fecha === yyyy_mm_dd && ['pendiente', 'confirmado'].includes(t.estado)).length;
    $('#kpiTurnosHoy').textContent = turnosHoy.toString();

    const horasTomadas = new Set(Turno.filter(t => t.fecha === yyyy_mm_dd).map(t => t.hora));
    const libres = Disponibilidad.filter(d => d.fecha === yyyy_mm_dd && d.estado === 'disponible' && !horasTomadas.has(d.hora_desde)).length;
    $('#kpiDisponibles').textContent = libres.toString();

    const mes = yyyy_mm_dd.slice(0, 7);
    const atendidosMes = Turno.filter(t => t.estado === 'atendido' && t.fecha.startsWith(mes));
    const total = atendidosMes.reduce((acc, t) => acc + precioAtencion(t.id_tipo_atencion), 0);
    $('#kpiFacturacion').textContent = '$ ' + new Intl.NumberFormat('es-AR').format(total);
}

// ===== gráfico de turnos (por MES) =====

// clave de mes: "YYYY-MM"
function monthKey(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

// últimos N meses 
function lastNMonths(n = 6) {
    const now = new Date();
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        // label corto en español (si cambia de año, agrego el año)
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

    // evitar duplicados
    if (chartTurnosInstance) {
        chartTurnosInstance.destroy();
        chartTurnosInstance = null;
    }

    const months = lastNMonths(6);
    const labels = months.map(m => m.label);
    const buckets = Object.fromEntries(months.map(m => [m.key, { pendiente: 0, confirmado: 0, atendido: 0 }]));

    // contar por estado agrupando por mes
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
                x: {
                    stacked: true,
                    grid: { color: 'rgba(255,255,255,0.06)' },
                    ticks: { color: '#9CB2CC' }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.06)' },
                    ticks: { color: '#9CB2CC', precision: 0, stepSize: 1 }
                }
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

    // set inicial del total (último mes mostrado)
    if (totalSpan) {
        const last = dataPend.length - 1;
        const tot = dataPend[last] + dataConf[last] + dataAtnd[last];
        totalSpan.textContent = `Total mensual: ${tot}`;
    }
}

// ===== Próximos turnos =====
function renderProximos() {
    const cont = $('#listaProximos');
    cont.innerHTML = '';
    const prox = Turno
        .filter(t => t.fecha >= yyyy_mm_dd)
        .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
        .slice(0, 5);

    prox.forEach(t => {
        const li = document.createElement('a');
        li.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        li.innerHTML = `
      <div>
        <div class="fw-semibold">${nombreMascota(t.id_mascota)} — ${nombreAtencion(t.id_tipo_atencion)}</div>
        <small class="text-secondary">${t.fecha} ${t.hora} • ${nombreCliente(t.id_cliente)}</small>
      </div>
      <span class="badge rounded-pill ${badgeEstado(t.estado)}">${t.estado}</span>
    `;
        cont.appendChild(li);
    });
}
function badgeEstado(estado) {
    switch (estado) {
        case 'confirmado': return 'text-bg-info';
        case 'pendiente': return 'text-bg-warning';
        case 'prioridad': return 'text-bg-danger';
        case 'atendido': return 'text-bg-success';
        default: return 'text-bg-secondary';
    }
}

// ===== Tabla Disponibilidad=====
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

setUserBadgeFromSession();
renderKPIs();
renderChart();
renderProximos();
renderDisponibilidad();

// === PERFIL: menú desplegable ===
(function () {
    const btnPerfil = document.getElementById('btnPerfil');
    const menu = document.getElementById('menuPerfil');

    if (!btnPerfil || !menu) return;

    btnPerfil.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('d-none');
    });

    document.addEventListener('click', () => {
        if (!menu.classList.contains('d-none')) {
            menu.classList.add('d-none');
        }
    });

    // Cerrar sesión
    const btnCerrar = document.getElementById('btnCerrarSesion');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            sessionStorage.removeItem('dogtorUser');
            window.location.href = '../Html/index.html';
        });
    }

    // Editar perfil (placeholder)
    const btnEditar = document.getElementById('btnEditarPerfil');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            alert('Función "Editar perfil" en desarrollo.');
        });
    }

    // Cambiar clave (placeholder)
    const btnClave = document.getElementById('btnCambiarClave');
    if (btnClave) {
        btnClave.addEventListener('click', () => {
            alert('Función "Cambiar contraseña" en desarrollo.');
        });
    }
})();


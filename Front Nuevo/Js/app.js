import {
    getMascotaByClienteId, getTiposMascota, getAllAtenciones, getTiposAtencion,
    getDisponibilidad, getTurnosDisponibles,
    getAllMascotas, createAtencion, getTurnosByVeterinarioId, getTopServiciosReservados, getFacturacionSemanal
} from './api.js';

// ======================================================
// --- 1. VARIABLES GLOBALES Y CONFIGURACIÓN ---
// ======================================================
let Mascota = [];
let Tipo_Atencion = [];
let Disponibilidad = [];
let Turno = []; // ESTE ARRAY CONTIENE LOS DATOS DE TODOS LOS TURNOS HISTÓRICOS
let turnosHoy = [];
let TipoMascota = [];

// Instancias de gráficos para evitar el error "Canvas is already in use"
let chartFacturacionSemanalInstance = null;
let chartTopServiciosInstance = null;
let chartReservasDiaInstance = null; // Instancia para Reservas por Día
let chartTiposAtencionInstance = null; // Instancia para Tipos de Atención

const currentPage = window.location.pathname.split('/').pop();
const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const ITEMS_POR_PAGINA_TURNOS = 6;
let paginaActualTurnos = 1;

const SWAL_THEME = {
    background: '#1a202c',
    color: '#BFD4EA',
    confirmButtonColor: '#3498db',
    customClass: { title: 'text-info' }
};

const ITEMS_POR_PAGINA = 10;
let paginaActual = 1;
let totalPaginas = 0;
const hoy = new Date();
const yyyy_mm_dd = hoy.toISOString().slice(0, 10);
let totalPaginasTurnos = 0;

// DOM Selectors
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const btnPerfil = document.getElementById('btnPerfil');
const menuPerfil = document.getElementById('menuPerfil');

// Toggle Menú de Perfil
btnPerfil?.addEventListener('click', () => { menuPerfil.classList.toggle('d-none'); });
document.addEventListener('click', (e) => {
    if (!btnPerfil?.contains(e.target) && !menuPerfil?.contains(e.target)) { menuPerfil?.classList.add('d-none'); }
});


// ======================================================
// --- 2. FUNCIONES AUXILIARES ---
// ======================================================

function monthKey(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

function lastNMonths(n = 6, referenceDate = new Date()) {
    const capitalize = (s) => {
        if (typeof s !== 'string') return '';
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const months = [];
    const refYear = referenceDate.getFullYear();
    const refMonth = referenceDate.getMonth() + 1;

    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(refYear, refMonth - i, 1);

        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        let base = d.toLocaleString('es-AR', { month: 'long' });

        base = capitalize(base);

        const label = (d.getFullYear() !== refYear) ? `${base} ${d.getFullYear()}` : base;

        months.push({ key, label });
    }
    return months;
}
function formatFecha(fecha) {
    const f = new Date(fecha);
    return f.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatFechaHora(fecha, hora) {
    const d = new Date(`${fecha}T${hora}`);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();

    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

function generateColors(n) {
    const colors = [];
    for (let i = 0; i < n; i++) {
        const hue = Math.floor((360 / n) * i);
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
}

function badgeEstado(estadoNombre) {
    const estado = (estadoNombre || '').toLowerCase();
    switch (estado) {
        case 'reservado':
        case 'pendiente': return 'text-bg-warning text-dark';
        case 'finalizado':
        case 'atendido': return 'text-bg-success text-dark';
        case 'cancelado': return 'text-bg-danger text-dark';
        case 'libre': return 'text-bg-info text-dark';
        default: return 'text-bg-secondary text-dark';
    }
}

function showLoader() {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `<img src="../Assets/logo2.png" alt="Dogtor Logo" class="loader-logo"><div class="loader-container"><div class="loader-bar"></div></div><div class="loading-text">Cargando...</div>`;
        document.body.appendChild(overlay);
    }
    requestAnimationFrame(() => { overlay.classList.add('visible'); });
}

function hideLoader() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) { overlay.classList.remove('visible'); }
}

function setearIniciales() {
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

// ======================================================
// --- 2.5. FUNCIONES DE MENSAJES EN GRÁFICOS ---
// ======================================================

// Función para mostrar un mensaje de error o "sin datos" en el contenedor del gráfico
function showChartMessage(canvas, message, isError = false) {
    const container = canvas.parentNode;
    container.style.position = 'relative'; // Asegura posicionamiento relativo para el mensaje

    // Clear canvas
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    
    let messageDiv = document.getElementById(`chartMessage-${canvas.id}`);
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = `chartMessage-${canvas.id}`;
        messageDiv.className = 'chart-message-overlay text-center';
        messageDiv.style.position = 'absolute';
        messageDiv.style.top = '50%';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translate(-50%, -50%)';
        messageDiv.style.width = '90%';
        messageDiv.style.fontSize = '1.1rem';
        messageDiv.style.padding = '10px';
        container.appendChild(messageDiv);
    }
    
    messageDiv.textContent = message;
    messageDiv.style.color = isError ? '#dc3545' : '#BFD4EA'; // Rojo para error, gris/azul para no data
    messageDiv.classList.remove('d-none');
}

// Función para ocultar el mensaje
function hideChartMessage(canvas) {
    const messageDiv = document.getElementById(`chartMessage-${canvas.id}`);
    if (messageDiv) {
        messageDiv.classList.add('d-none');
    }
}

// ======================================================
// --- 3. FUNCIONES DE CARGA DE DATOS (API) ---
// ======================================================

async function cargarMascotas() {
    try {
        const res = await getAllMascotas();
        if (!res.ok) throw new Error('Error al cargar mascotas');
        Mascota = await res.json();
    } catch (err) { Mascota = []; }
}

async function cargarTiposAtencion() {
    try {
        const res = await getTiposAtencion();
        if (!res.ok) throw new Error('Error al cargar tipos de atención');
        Tipo_Atencion = await res.json();
    } catch (err) { Tipo_Atencion = []; }
}

async function cargarDisponibilidad() {
    try {
        const res = await getDisponibilidad();
        if (res.status === 404) { Disponibilidad = []; return; }
        if (!res.ok) throw new Error(`Error ${res.status}: Fallo al cargar la agenda.`);
        Disponibilidad = await res.json();
    } catch (err) { Disponibilidad = []; }
}

async function cargarTurnosDisponibles() {
    // Solo se mantiene por si lo usan los KPIs, pero no es crucial para Turno[]
    try { await getTurnosDisponibles(); } catch (err) { /* silent fail */ }
}

async function cargarTurnosProximos() {
    // Carga TODOS los turnos para el análisis del dashboard (gráficos por mes)
    try {
        const res = await getAllAtenciones();
        if (!res.ok) throw new Error(`Error al cargar turnos (status ${res.status})`);
        const data = await res.json();
        Turno = data.map(t => ({
            id: t.codAtencion,
            fecha: t.disponibilidad?.fecha?.split('T')[0] || '',
            hora: t.disponibilidad?.hora?.substring(0, 5) || '',
            estado: t.disponibilidad?.codEstadoNavigation?.nombre || t.disponibilidad?.estado?.nombre || 'Desconocido',
            nombreMascota: t.mascota?.nombre || '—',
            nombreAtencion: t.tipoAtencion?.atencion || '—',
            importe: t.importe,
            nombreCliente: t.mascota?.cliente ? `${t.mascota.cliente.nombre} ${t.mascota.cliente.apellido}` : '—',
            nombreVeterinario: t.veterinario?.nombre ? `${t.veterinario.nombre} ${t.veterinario.apellido}` : 'Sin asignar'
        }));
    } catch (err) { Turno = []; }
}

async function cargarTurnosVeterinario() {
    // Carga solo los turnos del veterinario (usado en inicio.html)
    const rawUser = sessionStorage.getItem('dogtorUser');
    if (!rawUser) return;
    const user = JSON.parse(rawUser);
    const codVeterinario = user.id;

    try {
        const res = await getTurnosByVeterinarioId(codVeterinario);
        if (!res.ok) throw new Error(`Error al cargar turnos del veterinario (status ${res.status})`);
        const data = await res.json();
        // Sobreescribe Turno[] para mostrar solo los del veterinario en la tabla/lista
        Turno = data.map(t => ({
            id: t.codAtencion,
            fecha: t.disponibilidadNavigation?.fecha?.split('T')[0] || '',
            hora: t.disponibilidadNavigation?.hora?.substring(0, 5) || '',
            estado: t.disponibilidadNavigation?.estado?.nombre || 'Desconocido',
            nombreMascota: t.mascotaNavigation?.nombre || '—',
            nombreAtencion: t.tipoAtencionNavigation?.atencion || '—',
            importe: t.importe,
            nombreCliente: t.mascotaNavigation?.cliente ? `${t.mascotaNavigation.cliente.nombre} ${t.mascotaNavigation.cliente.apellido}` : '—',
        }));
    } catch (err) { Turno = []; }
}

async function cargarDatos(userId) {
    // Carga de datos generales para todas las secciones
    await Promise.all([
        cargarMascotas(),
        cargarTiposAtencion(),
        cargarDisponibilidad(),
        cargarTurnosDisponibles()
    ]);
}


// ======================================================
// --- 4. FUNCIONES DE DASHBOARD (KPIs y Gráficos) ---
// ======================================================

function renderKPIs() {
    const kpiPacientes = $('#kpiPacientes');
    if (kpiPacientes) kpiPacientes.textContent = Mascota.length.toString();

    $('#kpiTurnosHoy').textContent = Turno.length.toString();

    const libres = Disponibilidad.filter(t => t.estado?.nombre?.toLowerCase() === 'libre').length;
    $('#kpiDisponibles').textContent = libres.toString();

    const total = Turno.filter(t => (t.estado || '').toString().toLowerCase() === 'finalizado').reduce((acumulador, t) => acumulador + (t.importe || 0), 0);
    $('#kpiFacturacion').textContent = '$ ' + new Intl.NumberFormat('es-AR').format(total);
}

// Inicializa el <select> del filtro de mes y llama a renderTopServiciosChart()
function populateMonthFilter() {
    const filter = document.getElementById('filtroMes');
    if (!filter) return;

    const allMonths = lastNMonths(12, new Date());
    filter.innerHTML = '';

    allMonths.forEach(m => {
        const option = document.createElement('option');
        option.value = m.key;
        option.textContent = m.label;
        filter.appendChild(option);
    });

    filter.value = allMonths[allMonths.length - 1].key;
    // Llama a la nueva función de gráfico de Top Servicios que usa la API
    renderTopServiciosChart(); 
}

// *** FUNCIÓN DE GRÁFICO DE TOP SERVICIOS (USANDO LA API) ***
async function renderTopServiciosChart(mesDesdeFiltro = null) {
    const canvas = document.getElementById('chartTopServicios');
    if (!canvas || typeof Chart === 'undefined') return;

    if (chartTopServiciosInstance) chartTopServiciosInstance.destroy();

    // 1. OBTENER EL MES DEL FILTRO (ignora el argumento de evento si se pasó)
    const selectedMonthKey = document.getElementById('filtroMes')?.value || null;

    // Ocultar mensaje de error/sin datos previo si existe
    hideChartMessage(canvas);
    
    // Resetear total
    const totalEl = document.getElementById('chartTotal');
    if (totalEl) totalEl.textContent = 'Total reservas: 0';
    
    let topServicios = [];
    let errorMessage = null;

    try {
        const response = await getTopServiciosReservados(selectedMonthKey); 
        
        if (response.ok) {
            topServicios = await response.json();
            console.log("Top servicios:", topServicios);
        } else if (response.status === 404) {
             errorMessage = `No existen datos de servicios reservados para ${selectedMonthKey || 'el período actual'}.`;
        } else {
             errorMessage = `Error ${response.status}: Fallo al cargar los Top Servicios.`;
             console.error(errorMessage);
        }
    } catch (error) {
        console.error("Error al obtener el Top Servicios:", error);
        errorMessage = `Error de conexión: ${error.message}`;
    }

    // 2. Manejo de SIN DATOS o ERROR
    if (errorMessage || !topServicios.length) {
        // Usamos showChartMessage para mostrar el mensaje sin romper el DOM
        const isFatal = errorMessage && !errorMessage.includes("No existen datos");
        const messageToShow = errorMessage || 'No hay datos de servicios para mostrar.';
        showChartMessage(canvas, messageToShow, isFatal);
        return;
    }

    // Aseguramos que el canvas esté visible 
    canvas.classList.remove('d-none');
    
    // 3. Preparar datos y renderizar gráfico
    // Nota: Usamos 'nombreServicio' y 'totalReservas' según tu implementación actual.
    const labels = topServicios.map(s => s.nombreServicio);
    const data = topServicios.map(s => s.totalReservas);
    const colors = generateColors(labels.length);

    chartTopServiciosInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Total de Reservas',
                data,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animations: {
                tension: { duration: 1000, easing: 'easeInOutQuart', from: 0, to: 0.4, loop: false }
            },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Top servicios más reservados',
                    color: '#BFD4EA'
                },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const value = ctx.parsed.y;
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            // Cuidado: total puede ser 0 si la llamada es vacía, aunque ya lo filtramos arriba.
                            const pct = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0.0%';
                            return `${ctx.label}: ${value} (${pct})`;
                        }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutBounce',
                onProgress: function() {
                    // Solo actualiza el total si la instancia del chart existe
                    if(chartTopServiciosInstance) {
                       const totalActual = chartTopServiciosInstance.data.datasets[0].data.reduce((a, b) => a + b, 0);
                       if (totalEl) totalEl.textContent = `Total reservas: ${totalActual}`;
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#9CB2CC' }, grid: { color: 'rgba(255,255,255,0.06)' } },
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, color: '#9CB2CC', grid: { color: 'rgba(255,255,255,0.06)' } }
                }
            }
        }
    });

    // Inicializar total final
    const total = data.reduce((a, b) => a + b, 0);
    if (totalEl) totalEl.textContent = `Total reservas: ${total}`;
}


function renderReservasPorDia() {
    const canvas = document.getElementById('chartReservasDia');
    if (!canvas || typeof Chart === 'undefined') return;

    // 🚨 Destruir la instancia anterior (Corrección)
    if (chartReservasDiaInstance) {
        chartReservasDiaInstance.destroy();
        chartReservasDiaInstance = null;
    }

    chartReservasDiaInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Reservas',
                data: [5, 7, 3, 8, 4, 6, 2], // Datos mock
                borderColor: '#0dcaf0',
                fill: false
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: true, labels: { color: '#BFD4EA' } },
                title: { display: true, text: 'Reservas por Día de la Semana', color: '#BFD4EA' },
                tooltip: { callbacks: { label: ctx => `Reservas: ${ctx.parsed.y}` } }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#9CB2CC' } },
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#9CB2CC' } }
            }
        }
    });
}

function renderTiposAtencionChart() {
    const canvas = document.getElementById('chartTiposAtencion');
    if (!canvas || typeof Chart === 'undefined') return;

    // 🚨 Destruir la instancia anterior (Corrección)
    if (chartTiposAtencionInstance) {
        chartTiposAtencionInstance.destroy();
        chartTiposAtencionInstance = null;
    }

    chartTiposAtencionInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Consulta', 'Vacunación', 'Cirugía', 'Control'],
            datasets: [{
                data: [30, 20, 10, 40], // Datos mock o calculados de Tipo_Atencion
                backgroundColor: ['#198754', '#ffc107', '#dc3545', '#0d6efd']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { color: '#BFD4EA' } } }
        }
    });
}

function aggregateDailyData(datos) {
    const aggregated = datos.reduce((acc, curr) => {
        const dateKey = new Date(curr.fechaFac).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        if (acc[dateKey]) acc[dateKey].facturado += curr.facturado;
        else acc[dateKey] = { fechaFac: curr.fechaFac, facturado: curr.facturado };
        return acc;
    }, {});
    return Object.values(aggregated).sort((a, b) => new Date(a.fechaFac) - new Date(b.fechaFac));
}

async function renderFacturacionSemanalChart() {
    const canvas = document.getElementById('chartFacturacionSemanal');
    const loading = document.getElementById('loadingFacturacion');
    if (!canvas || typeof Chart === 'undefined') return;

    loading?.classList.remove('d-none');
    if (chartFacturacionSemanalInstance) chartFacturacionSemanalInstance.destroy();

    const inputDesde = document.getElementById('filtroFechaDesde');
    const inputHasta = document.getElementById('filtroFechaHasta');

    let fecMax = inputHasta?.value || new Date().toISOString().split('T')[0];
    let fecMin = inputDesde?.value || new Date(new Date().setDate(new Date(fecMax).getDate() - 42)).toISOString().split('T')[0];

    let datosCrudos = [];
    try {
        datosCrudos = await getFacturacionSemanal(fecMin, fecMax);
    } catch (err) {
        loading?.classList.add('d-none');
        return;
    }
    loading?.classList.add('d-none');

    if (!Array.isArray(datosCrudos) || !datosCrudos.length) {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById('chartFacturacionTotal').textContent = 'Total: 0';
        return;
    }

    const datosAgregados = aggregateDailyData(datosCrudos);
    const labels = datosAgregados.map(d => new Date(d.fechaFac).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }));
    const data = datosAgregados.map(d => d.facturado);
    const total = data.reduce((a, b) => a + b, 0);

    chartFacturacionSemanalInstance = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Facturación ($)', data, borderColor: '#0DCAF0', backgroundColor: 'rgba(13, 202, 240, 0.15)', tension: 0.4, fill: true, borderWidth: 3 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { title: { display: true, text: 'Evolución de la Facturación Semanal', color: '#BFD4EA' }, tooltip: { callbacks: { label: ctx => `Facturado: $${ctx.parsed.y.toLocaleString('es-AR')}` } } },
            scales: { x: { ticks: { color: '#9CB2CC' } }, y: { beginAtZero: true, ticks: { color: '#9CB2CC', callback: v => `$${v.toLocaleString('es-AR', { maximumFractionDigits: 0 })}` } } }
        }
    });

    document.getElementById('chartFacturacionTotal').textContent = `Total: $${total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

// ======================================================
// --- 5. FUNCIONES DE INICIO.HTML (Tablas y Modal) ---
// ======================================================

function renderProximos(Turno) {
    const lista = document.getElementById("listaProximos");
    lista.innerHTML = "";

    if (!Turno || Turno.length === 0) {
        lista.innerHTML = '<div class="list-group-item text-muted">No hay turnos próximos</div>';
        return;
    }

    // En inicio.html generalmente se muestran los turnos activos
    const turnosReservados = Turno.filter(t => (t.estado || '').toLowerCase() === 'reservado');

    if (turnosReservados.length === 0) {
        lista.innerHTML = '<div class="list-group-item text-muted">No hay turnos próximos</div>';
        return;
    }

    turnosReservados.forEach(t => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';

        item.style.backgroundColor = '#7b5325ff';
        item.style.borderLeft = '5px solid #b58c11ff';
        item.style.marginBottom = '8px';
        item.style.borderRadius = '8px';
        item.style.padding = '10px 15px';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.color = '#000';

        item.innerHTML = `
             <div style="font-weight: 500; font-size: 1rem;">
                 <strong>${formatFecha(t.fecha)} ${t.hora}</strong> - ${t.nombreMascota || '-'} - ${t.nombreAtencion || '-'}
                 <div style="font-size: 0.9rem; color: #120087ff;">${"Dueño: " + t.nombreCliente || '-'}</div>
             </div>
             <span style="
                 background-color: #ebeb4eff;
                 color: #000;
                 font-size: 0.75rem;
                 padding: 0.3em 0.6em;
                 border-radius: 12px;
                 font-weight: 600;
             ">
                 Reservado
             </span>
        `;
        lista.appendChild(item);
    });
}

function renderProximosPaginados() {
    const lista = document.getElementById("listaProximos");
    if (!lista) return;

    lista.innerHTML = "";

    const turnosFiltrados = Turno.filter(t => {
        const estadoLower = (t.estado || '').toLowerCase();
        return t.fecha === yyyy_mm_dd && (estadoLower === 'reservado' || estadoLower === 'confirmado');
    });

    if (!turnosFiltrados || turnosFiltrados.length === 0) {
        lista.innerHTML = '<div class="list-group-item text-muted">No hay turnos próximos hoy</div>';
        document.getElementById('proximosPaginacion')?.remove();
        return;
    }

    totalPaginasTurnos = Math.ceil(turnosFiltrados.length / ITEMS_POR_PAGINA_TURNOS);
    const inicio = (paginaActualTurnos - 1) * ITEMS_POR_PAGINA_TURNOS;
    const fin = inicio + ITEMS_POR_PAGINA_TURNOS;
    const turnosPagina = turnosFiltrados.slice(inicio, fin);

    const colorEstado = (estadoString) => {
        const estadoLower = (estadoString || '').toLowerCase();
        switch (estadoLower) {
            case 'reservado': return 'warning';
            case 'confirmado': return 'success';
            case 'cancelado': return 'danger';
            default: return 'secondary';
        }
    };

    turnosPagina.forEach(turno => {
        const item = document.createElement("div");
        item.className = "list-group-item d-flex justify-content-between align-items-center";

        item.innerHTML = `
             <div>
                 <strong>${turno.nombreMascota}</strong> (${turno.nombreCliente})
                 <div class="text-secondary small">${formatFechaHora(turno.fecha, turno.hora)}</div>
             </div>
             <span class="badge bg-${colorEstado(turno.estado)} text-dark rounded-pill">${turno.estado}</span>
        `;
        lista.appendChild(item);
    });

    renderPaginacionTurnos();
}

function renderPaginacion(container) {
    document.getElementById('disponibilidadPaginacion')?.remove();
    if (totalPaginas <= 1) return;

    const nav = document.createElement('nav');
    nav.className = 'mt-3 d-flex justify-content-center';
    nav.setAttribute('aria-label', 'Paginación de disponibilidad');
    nav.id = 'disponibilidadPaginacion';

    const ul = document.createElement('ul');
    ul.className = 'pagination pagination-sm justify-content-center mb-0';

    ul.innerHTML += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${paginaActual - 1}">Anterior</a></li>`;
    let startPage = Math.max(1, paginaActual - 2);
    let endPage = Math.min(totalPaginas, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
        ul.innerHTML += `<li class="page-item ${i === paginaActual ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    ul.innerHTML += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${paginaActual + 1}">Siguiente</a></li>`;
    nav.appendChild(ul);

    const containerEl = container?.closest('.table-responsive') || container;
    containerEl?.insertAdjacentElement('afterend', nav);

    nav.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newPage = parseInt(e.target.dataset.page);
            if (newPage > 0 && newPage <= totalPaginas && newPage !== paginaActual) {
                paginaActual = newPage;
                renderDisponibilidad();
            }
        });
    });
}

function renderPaginacionTurnos() {
    document.getElementById('proximosPaginacion')?.remove();
    if (totalPaginasTurnos <= 1) return;

    const nav = document.createElement('nav');
    nav.id = 'proximosPaginacion';
    nav.className = 'mt-2 d-flex justify-content-center';
    const ul = document.createElement('ul');
    ul.className = 'pagination pagination-sm justify-content-center mb-0';

    ul.innerHTML += `<li class="page-item ${paginaActualTurnos === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${paginaActualTurnos - 1}">Anterior</a></li>`;
    let startPage = Math.max(1, paginaActualTurnos - 2);
    let endPage = Math.min(totalPaginasTurnos, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
        ul.innerHTML += `<li class="page-item ${i === paginaActualTurnos ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }

    ul.innerHTML += `<li class="page-item ${paginaActualTurnos === totalPaginasTurnos ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${paginaActualTurnos + 1}">Siguiente</a></li>`;
    nav.appendChild(ul);
    document.getElementById("listaProximos").insertAdjacentElement('afterend', nav);

    nav.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newPage = parseInt(e.target.dataset.page);
            if (newPage > 0 && newPage <= totalPaginasTurnos && newPage !== paginaActualTurnos) {
                paginaActualTurnos = newPage;
                renderProximosPaginados();
            }
        });
    });
}

function renderDisponibilidad() {
    const tbody = $('#tablaDisponibilidad');
    const tablaContainer = tbody?.closest('.table-responsive');
    if (!tbody || !tablaContainer) return;
    tbody.innerHTML = '';

    const slotsHoy = Disponibilidad
        .filter(d => d.fecha?.split('T')[0] === yyyy_mm_dd)
        .sort((a, b) => a.hora.localeCompare(b.hora));

    totalPaginas = Math.ceil(slotsHoy.length / ITEMS_POR_PAGINA);

    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    const slotsPagina = slotsHoy.slice(inicio, fin);

    if (slotsPagina.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay disponibilidad para el día de hoy.</td></tr>';
    } else {
        slotsPagina.forEach((d, i) => {
            const estadoNombre = d.estado?.nombre || 'Libre';
            const esLibre = estadoNombre.toLowerCase() === 'libre';

            const tr = document.createElement('tr');
            tr.classList.add("float-in");

            const fechaSlot = d.fecha?.split('T')[0];
            const horaSlot = d.hora.substring(0, 5);

            tr.innerHTML = `
                 <td>${formatFecha(d.fecha)}</td>
                 <td>${horaSlot}</td>
                 <td><span class="badge rounded-pill ${badgeEstado(estadoNombre)}">${estadoNombre}</span></td>
                 <td class="text-center w-end">
                     <button class="btn btn-sm btn-outline-info" 
                             ${!esLibre ? 'disabled' : ''} 
                             data-disponibilidad-id="${d.codDisponibilidad}">
                         Tomar turno
                     </button>
                 </td>
            `;

            tr.style.animationDelay = `${i * 0.08}s`;

            tbody.appendChild(tr);

            const btnTomarTurno = tr.querySelector('button');
            if (btnTomarTurno && esLibre) {
                btnTomarTurno.addEventListener('click', () => {
                    abrirModalTurno(d.codDisponibilidad, fechaSlot, horaSlot);
                });
            }
        });
    }

    renderPaginacion(tablaContainer);
}


// --- Lógica del Modal de Turnos ---

async function poblarSelectMascotasPorCliente(codCliente) {
    const selectMascota = $('#tMascota');
    const inputTutor = $('#tTutor');
    const statusDiv = $('#tTutorDniStatus');

    selectMascota.innerHTML = '<option value="">Seleccione mascota...</option>';
    selectMascota.disabled = true;
    inputTutor.value = '';
    statusDiv.textContent = 'Buscando mascotas...';

    if (!codCliente || isNaN(codCliente)) {
        statusDiv.textContent = 'Ingrese el DNI para buscar las mascotas.';
        return;
    }

    try {
        const res = await getMascotaByClienteId(codCliente);

        if (res.ok) {
            const mascotasCliente = await res.json();

            if (mascotasCliente.length === 0) {
                statusDiv.textContent = 'No se encontraron mascotas activas para ese cliente.';
                return;
            }

            mascotasCliente.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.codMascota;
                opt.textContent = m.nombre;
                selectMascota.appendChild(opt);
            });

            const cliente = mascotasCliente[0].codClienteNavigation || mascotasCliente[0].cliente;
            if (cliente) {
                inputTutor.value = `${cliente.nombre} ${cliente.apellido}`;
            } else {
                inputTutor.value = 'Tutor encontrado';
            }

            selectMascota.disabled = false;
            statusDiv.textContent = `Mascotas encontradas para ${inputTutor.value}.`;

        } else if (res.status === 404) {
            statusDiv.textContent = 'Cliente no encontrado o sin mascotas activas.';
        } else {
            throw new Error(`Error ${res.status} al buscar cliente.`);
        }

    } catch (err) {
        console.error("Error en búsqueda dinámica:", err);
        statusDiv.textContent = 'Error de conexión o DNI inválido.';
    }
}

function setupBusquedaDinamica() {
    const inputDni = $('#tTutorDni');
    const btnBuscar = $('#btnBuscarCliente');
    const inputFecha = document.getElementById('tFecha');

    if (inputFecha) {
        inputFecha.addEventListener('change', cargarHorasDisponiblesPorFecha);
    }
    if (!inputDni || !btnBuscar) return;

    btnBuscar.addEventListener('click', () => {
        const dniValue = inputDni.value.trim();
        const codCliente = parseInt(dniValue);

        if (!isNaN(codCliente) && codCliente > 0) {
            poblarSelectMascotasPorCliente(codCliente);
        } else {
            $('#tTutorDniStatus').textContent = 'Por favor, ingrese un número de DNI válido.';
        }
    });
}

function poblarSelectTiposAtencion(tipos) {
    const select = $('#tAtencion');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione tipo de atención</option>';
    tipos.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.codTipoA;
        opt.textContent = t.atencion;
        select.appendChild(opt);
    });
}

function abrirModalTurno(codDisponibilidad, fecha, hora) {
    const modalElement = document.getElementById('modalTurno');
    if (!modalElement || typeof bootstrap === 'undefined') { return; }

    document.getElementById('formTurno')?.reset();

    const inputFecha = document.getElementById('tFecha');
    const selectHora = document.getElementById('tHora');

    if (inputFecha) { inputFecha.value = fecha; inputFecha.disabled = true; }

    if (selectHora) {
        selectHora.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = hora;
        opt.textContent = hora;
        selectHora.appendChild(opt);
        selectHora.disabled = true;
    }

    document.getElementById('tCodDisponibilidad').value = codDisponibilidad;

    document.getElementById('tTutorDni').value = '';
    document.getElementById('tTutor').value = '';
    document.getElementById('tTutorDniStatus').textContent = 'Ingrese el DNI para buscar las mascotas.';
    document.getElementById('tMascota').innerHTML = '<option value="">Seleccione mascota...</option>';
    document.getElementById('tMascota').disabled = true;

    new bootstrap.Modal(modalElement).show();

    poblarSelectTiposAtencion(Tipo_Atencion);
}

async function guardarTurno(e) {
    e.preventDefault();

    const form = e.target;
    const btnGuardar = form.querySelector('button[type="submit"]');
    const alertBox = $('#tAlert');

    const rawUser = sessionStorage.getItem('dogtorUser');
    const user = rawUser ? JSON.parse(rawUser) : null;
    const codVeterinario = user?.id;

    alertBox.classList.add('d-none');

    if (!codVeterinario) {
        alertBox.textContent = 'Error: No se pudo identificar al veterinario.';
        alertBox.classList.remove('d-none');
        return;
    }

    const codDisponibilidad = document.getElementById('tCodDisponibilidad')?.value || document.getElementById('tHora')?.value;
    const codMascota = $('#tMascota').value;
    const codTipoAtencion = $('#tAtencion').value;

    if (!codMascota || !codTipoAtencion || !codDisponibilidad) {
        alertBox.classList.add('alert-danger');
        alertBox.textContent = 'Por favor, complete los campos Mascota, Tipo de Atención y Hora.';
        alertBox.classList.remove('d-none');
        return;
    }

    const usuario = JSON.parse(sessionStorage.getItem('dogtorUser') || '{}');
    const insertTurnoData = {
        CodMascota: codMascota,
        CodTipoA: parseInt(codTipoAtencion),
        CodVeterinario: usuario?.id
    };

    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';
    alertBox.classList.remove('alert-danger');

    try {
        const res = await createAtencion(insertTurnoData, codDisponibilidad);

        if (res.ok) {

            Swal.fire({
                title: '¡Turno Insertado!',
                html: 'El slot ha sido reservado con éxito en la agenda.',
                icon: 'success',
                ...SWAL_THEME,
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false,
                customClass: { title: 'swal2-title-custom' }
            }).then(() => {
                const modalElement = document.getElementById('modalTurno');
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();

                // Recargar datos y dashboard
                initDashboard()
                cargarDatos(codVeterinario);
            });
        } else {
            const errorText = await res.text();
            let errorMessage = `Error ${res.status}: Fallo al crear el turno.`;
            try { errorMessage = JSON.parse(errorText).message || errorMessage; } catch { }
            throw new Error(errorMessage);
        }
    } catch (err) {
        alertBox.classList.add('alert-danger');
        alertBox.textContent = `Error: ${err.message || 'Error de conexión.'}`;
        alertBox.classList.remove('d-none');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar';
    }
}

function setupFormTurnoSubmit() {
    const formTurno = $('#formTurno');
    if (formTurno) { formTurno.addEventListener('submit', guardarTurno); }
}

function cargarHorasDisponiblesPorFecha() {
    const inputFecha = document.getElementById('tFecha');
    const selectHora = document.getElementById('tHora');
    const alertBox = document.getElementById('tAlert');

    const fechaSeleccionada = inputFecha.value;

    selectHora.innerHTML = '<option value="">Seleccione hora</option>';
    selectHora.disabled = true;

    if (!fechaSeleccionada) return;

    const slotsDisponibles = Disponibilidad
        .filter(d =>
            d.fecha.startsWith(fechaSeleccionada) &&
            d.estado?.nombre?.toLowerCase() === 'libre'
        )
        .sort((a, b) => a.hora.localeCompare(b.hora));

    if (slotsDisponibles.length === 0) {
        selectHora.innerHTML = '<option value="">No hay horarios libres</option>';
        alertBox.textContent = "No hay horarios libres para la fecha seleccionada.";
        alertBox.classList.remove('d-none');
    } else {
        slotsDisponibles.forEach(d => {
            const opt = document.createElement('option');
            const horaString = d.hora.substring(0, 5);

            opt.value = d.codDisponibilidad;
            opt.textContent = horaString;
            selectHora.appendChild(opt);
        });
        selectHora.disabled = false;
        alertBox.classList.add('d-none');
    }
}


// ======================================================
// --- 6. INICIALIZACIÓN PRINCIPAL Y DISPATCHER ---
// ======================================================

async function initDashboard() {
    const raw = sessionStorage.getItem('dogtorUser');
    if (!raw) {
        window.location.href = '../Pages/index.html';
        return;
    }
    showLoader();
    const user = JSON.parse(raw);

    try {
        // Carga de datos base (Mascotas, TiposAtencion, Disponibilidad, TurnosDisponibles)
        await cargarDatos(user.id);

        // Configuración de UI común
        setearIniciales();
        setupPerfilMenu();
        setupFormTurnoSubmit();
        setupBusquedaDinamica();

        // --- LÓGICA ESPECÍFICA POR PÁGINA ---

        if (currentPage === 'dashboard.html') {
            // Cargar TODOS los turnos para estadísticas del dashboard
            await cargarTurnosProximos();

            // Renderizado de elementos de Dashboard
            renderKPIs();
            populateMonthFilter(); // Inicializa filtro y llama a renderTopServiciosChart()
            document.getElementById('btnFiltrarFacturacion')?.addEventListener('click', renderFacturacionSemanalChart);
            
            // CORRECCIÓN CLAVE: Envolver la llamada en una función anónima
            document.getElementById('btnFiltrarMes')?.addEventListener('click', () => {
                 renderTopServiciosChart();
            });
            
            renderReservasPorDia();
            renderTiposAtencionChart();
            renderFacturacionSemanalChart();

        } else if (currentPage === 'inicio.html') {
            // Cargar turnos específicos del veterinario (o solo los próximos/reservados)
            await cargarTurnosVeterinario();

            // Renderizar elementos de trabajo diario
            renderKPIs();
            paginaActualTurnos = 1;
            renderProximos();
            renderProximosPaginados();
            renderDisponibilidad();
        }

    } catch (err) {
        console.error("Error fatal en initDashboard:", err);
    } finally {
        hideLoader();
    }
}

function setupPerfilMenu() {
    const raw = sessionStorage.getItem('dogtorUser');
    if (!raw) return;

    const user = JSON.parse(raw);
    const perfilBtn = document.getElementById('btnPerfil');
    const dropdownMenu = document.getElementById('menuPerfil');

    if (!perfilBtn || !dropdownMenu) return;

    const iniciales = `${(user.nombre?.[0] || 'U')}${(user.apellido?.[0] || 'S')}`.toUpperCase();
    perfilBtn.textContent = iniciales;

    perfilBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && !perfilBtn.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    btnCerrarSesion?.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('dogtorUser');
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        window.location.href = '../Pages/index.html';
    });
}
document.addEventListener('DOMContentLoaded', initDashboard);

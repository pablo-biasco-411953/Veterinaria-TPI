import { 
    // Asegúrate de que getMascotaByClienteId esté bien importado y funcione con el codCliente.
    getMascotaByClienteId, getTiposMascota, getAllAtenciones, getTiposAtencion, 
    getDisponibilidad, getTurnosDisponibles,
    getAllMascotas,createAtencion,getTurnosByVeterinarioId, getTopServiciosReservados
} from './api.js';

// ===== Variables globales =====
let Mascota = []; 
let Tipo_Atencion = [];
let Disponibilidad = [];
let Turno = [];
let turnosHoy = [];

const ITEMS_POR_PAGINA_TURNOS = 6; 
let paginaActualTurnos = 1;

let TipoMascota = []; 
const SWAL_THEME = {
    background: '#1a202c', 
    color: '#BFD4EA', 
    confirmButtonColor: '#3498db',
    customClass: { title: 'text-info' } 
};
let chartTopServiciosInstance = null;
const ITEMS_POR_PAGINA = 10;
let paginaActual = 1;
let totalPaginas = 0;
const hoy = new Date();
const yyyy_mm_dd = hoy.toISOString().slice(0, 10);

// ===== Helpers DOM =====
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const btnPerfil = document.getElementById('btnPerfil');
const menuPerfil = document.getElementById('menuPerfil');

btnPerfil.addEventListener('click', () => {
    menuPerfil.classList.toggle('d-none');
});

// Opcional: cerrar al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!btnPerfil.contains(e.target) && !menuPerfil.contains(e.target)) {
        menuPerfil.classList.add('d-none');
    }
});


function formatFecha(fecha) {
    const f = new Date(fecha);
    return f.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}


function renderProximosPaginados() {
    const lista = document.getElementById("listaProximos");
    lista.innerHTML = "";

    if (!turnosHoy || turnosHoy.length === 0) {
        lista.innerHTML = '<div class="list-group-item text-muted">No hay turnos próximos hoy</div>';
        return;
    }

    // 1️⃣ Calcular total de páginas
    totalPaginasTurnos = Math.ceil(turnosHoy.length / ITEMS_POR_PAGINA_TURNOS);
    const inicio = (paginaActualTurnos - 1) * ITEMS_POR_PAGINA_TURNOS;
    const fin = inicio + ITEMS_POR_PAGINA_TURNOS;
    const turnosPagina = turnosHoy.slice(inicio, fin);

    // 2️⃣ Renderizar items
    const colorEstado = (estado) => {
        switch(estado.toLowerCase()) {
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
                <div class="text-secondary small">${turno.fecha} ${turno.hora}</div>
            </div>
            <span class="badge bg-${colorEstado(turno.estado)} text-dark rounded-pill">${turno.estado}</span>
        `;
        lista.appendChild(item);
    });

    // 3️⃣ Renderizar botones de paginación
    renderPaginacionTurnos();
}

function renderPaginacionTurnos() {
    // Elimina paginación anterior
    document.getElementById('proximosPaginacion')?.remove();

    if (totalPaginasTurnos <= 1) return;

    const nav = document.createElement('nav');
    nav.id = 'proximosPaginacion';
    nav.className = 'mt-2 d-flex justify-content-center';

    const ul = document.createElement('ul');
    ul.className = 'pagination';

    // Botón anterior
    ul.innerHTML += `
        <li class="page-item ${paginaActualTurnos === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${paginaActualTurnos - 1}">Anterior</a>
        </li>
    `;

    // Botones de páginas
    let startPage = Math.max(1, paginaActualTurnos - 2);
    let endPage = Math.min(totalPaginasTurnos, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
        ul.innerHTML += `
            <li class="page-item ${i === paginaActualTurnos ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    // Botón siguiente
    ul.innerHTML += `
        <li class="page-item ${paginaActualTurnos === totalPaginasTurnos ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${paginaActualTurnos + 1}">Siguiente</a>
        </li>
    `;

    nav.appendChild(ul);
    document.getElementById("listaProximos").insertAdjacentElement('afterend', nav);

    // Listeners
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
function generateColors(count) {
    // Usamos tus colores de Bootstrap para la coherencia visual
    const baseColors = ['#0DCAF0', '#198754', '#FFC107', '#DC3545', '#6F42C1', '#20C997']; 
    // Si tienes más de 6 servicios, cicla los colores
    return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
}

async function renderTopServiciosChart() {
    const canvas = document.getElementById('chartTopServicios'); 
    if (!canvas || typeof Chart === 'undefined') return;

    if (chartTopServiciosInstance) {
        chartTopServiciosInstance.destroy();
    }

    let topServicios = [];
    try {
        const response = await getTopServiciosReservados(); 
        if (response.ok) {
            topServicios = await response.json();
            console.log("La data", topServicios)
        } else {
            console.error(`Error ${response.status} al cargar el Top Servicios.`);
            return;
        }
    } catch (error) {
        console.error("Error al obtener el Top Servicios:", error);
        return;
    }

    if (topServicios.length === 0) {
        canvas.replaceWith(document.createElement('p')).textContent = 'No hay datos para mostrar';
        return;
    }

    const labels = topServicios.map(s => s.nombreServicio);
    const data = topServicios.map(s => s.totalReservas);
    const colors = generateColors(labels.length);

    chartTopServiciosInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total de Reservas',
                data: data,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Top servicios más reservados',
                    color: '#BFD4EA'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) label += ': ';
                            const value = context.parsed.y;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1) + '%';
                            return `${label}${value} (${percentage})`;
                        }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutBounce',
                onProgress: function() {
                    const totalActual = chartTopServiciosInstance.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const totalEl = document.getElementById('chartTotal');
                    if (totalEl) totalEl.textContent = `Total reservas: ${totalActual}`;
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });

    // Inicializamos el total al cargar
    const totalReservas = data.reduce((a, b) => a + b, 0);
    const totalEl = document.getElementById('chartTotal');
    if (totalEl) totalEl.textContent = `Total reservas: ${totalReservas}`;
}


// 💡 FUNCIÓN ESTADO: Mapea el nombre del estado a una clase de Bootstrap (con texto negro)
function badgeEstado(estadoNombre) {
    const estado = (estadoNombre || '').toLowerCase(); 
    switch (estado) {
        case 'reservado':
        case 'pendiente': 
            return 'text-bg-warning text-dark';
        case 'finalizado':
        case 'atendido': 
            return 'text-bg-success text-dark';
        case 'cancelado': 
            return 'text-bg-danger text-dark'; 
        case 'libre': 
            return 'text-bg-info text-dark';
        default: 
            return 'text-bg-secondary text-dark'; 
    }
}

//  Lógica del Modal de Turnos (DNI y Mascota)

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
        // Llama a la API con el CodCliente obtenido del DNI 
        const res = await getMascotaByClienteId(codCliente); 

        if (res.ok) {
            const mascotasCliente = await res.json();
            
            if (mascotasCliente.length === 0) {
                statusDiv.textContent = 'No se encontraron mascotas activas para ese cliente.';
                return;
            }

            // Poblar Select
            mascotasCliente.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.codMascota;
                opt.textContent = m.nombre;
                selectMascota.appendChild(opt);
            });

            // Asignar el nombre del tutor
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
        // Conexión principal: Al cambiar la fecha, cargar las horas libres
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
    if (!modalElement || typeof bootstrap === 'undefined') {
        console.error("Modal #modalTurno no encontrado o Bootstrap no cargado.");
        return;
    }
    
    // Resetear el formulario
    document.getElementById('formTurno')?.reset();
    
    // Pre-cargar datos del slot de disponibilidad
    const inputFecha = document.getElementById('tFecha');
    const selectHora = document.getElementById('tHora');
    
    // 1. DESHABILITAR Y ASIGNAR FECHA
    if (inputFecha) {
        inputFecha.value = fecha;
        inputFecha.disabled = true; 
    }
    
    // 2. Limpiar y pre-cargar el select de Hora 
    if (selectHora) {
        selectHora.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = hora;
        opt.textContent = hora;
        selectHora.appendChild(opt);
        selectHora.disabled = true; 
    }
    
    // 3. Guardar el codDisponibilidad
    document.getElementById('tCodDisponibilidad').value = codDisponibilidad; 
    
    // 4. Limpiar selects dinámicos del DNI
    document.getElementById('tTutorDni').value = '';
    document.getElementById('tTutor').value = '';
    document.getElementById('tTutorDniStatus').textContent = 'Ingrese el DNI para buscar las mascotas.';
    document.getElementById('tMascota').innerHTML = '<option value="">Seleccione mascota...</option>';
    document.getElementById('tMascota').disabled = true;

    // Abrir el modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // Al abrir el modal, poblamos el select de Tipos de Atención
    poblarSelectTiposAtencion(Tipo_Atencion); 
}

// ===== Funciones de Renderizado (Dashboard) =====

async function renderKPIs() {
    const raw = sessionStorage.getItem('dogtorUser');
    if (!raw) return;
    const user = JSON.parse(raw);
    const userId = user.id;

    const kpiPacientes = $('#kpiPacientes');
    if (kpiPacientes) kpiPacientes.textContent = Mascota.length.toString();

    $('#kpiTurnosHoy').textContent = Turno.length.toString();
    
    // 🕒 Cantidad de turnos libres globales
    try {
        // Usamos getDisponibilidadFecha que trae SOLO los libres (por convención)
        const res = await getDisponibilidad(); 
        if (res.ok) {
            const turnos = await res.json();
            // Filtramos por el estado "Libre" si la API trae todos los estados
            const libres = turnos.filter(t => t.estado?.nombre?.toLowerCase() === 'libre').length;
            $('#kpiDisponibles').textContent = libres.toString();
        } else {
            $('#kpiDisponibles').textContent = '0';
        }
    } catch (err) {
        console.error('Error cargando turnos libres:', err);
        $('#kpiDisponibles').textContent = '0';
    }

    // 💰 Facturación simulada
    const total = Turno
    .filter(t => (t.estado || '').toString().toLowerCase() === 'finalizado')
    .reduce((acumulador, t) => acumulador + (t.importe || 0), 0);

$('#kpiFacturacion').textContent = 
    '$ ' + new Intl.NumberFormat('es-AR').format(total);
}

// ===== Gráfico de turnos (No modificado) =====
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
            // 💡 Lógica de mapeo de estados del backend a estados del gráfico
            const e = (t.estado || '').toLowerCase();
            
            if (e === 'reservado' || e === 'libre') buckets[key].pendiente++; 
            else if (e === 'finalizado') buckets[key].atendido++; 
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
            maintainAspectRatio: true,
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

function renderProximos(Turno) {
    const lista = document.getElementById("listaProximos");
    lista.innerHTML = ""; // limpiar lista

    if (!Turno || Turno.length === 0) {
        lista.innerHTML = '<div class="list-group-item text-muted">No hay turnos próximos</div>';
        return;
    }

    // Filtrar solo turnos con estado "Reservado"
    const turnosReservados = Turno.filter(t => {
        const estado = t.estado?.toLowerCase();
        console.log("jij",t)
        return estado === 'reservado';
    });

    if (turnosReservados.length === 0) {
        lista.innerHTML = '<div class="list-group-item text-muted">No hay turnos próximos</div>';
        return;
    }

   turnosReservados.forEach(t => {
    const item = document.createElement('div');
    item.className = 'list-group-item d-flex justify-content-between align-items-center';
    
    // Estilos inline para mantenerlo simple
    item.style.backgroundColor = '#7b5325ff';       // fondo claro
    item.style.borderLeft = '5px solid #b58c11ff'; // barra izquierda
    item.style.marginBottom = '8px';
    item.style.borderRadius = '8px';
    item.style.padding = '10px 15px';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.color = '#000'; // letra negra

    item.innerHTML = `
          <div style="font-weight: 500; font-size: 1rem;">
            <strong>${formatFecha(t.fecha)} ${t.hora}</strong> - ${t.nombreMascota || '-'} - ${t.nombreAtencion || '-'}
            <div style="font-size: 0.9rem; color: #120087ff;">${ "Dueño: "+t.nombreCliente || '-'}</div>
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
//  Función de Paginación 
function renderPaginacion(container) {
    
    // Buscamos el elemento por su ID y lo eliminamos.
    document.getElementById('disponibilidadPaginacion')?.remove();

    if (totalPaginas <= 1) return;

    const nav = document.createElement('nav');
    // 2. CENTRADO: Correcto. justify-content-center centra el ul en el nav.
    nav.className = 'mt-3 d-flex justify-content-center'; 
    
    nav.setAttribute('aria-label', 'Paginación de disponibilidad');
    nav.id = 'disponibilidadPaginacion';
    nav.className = 'mt-3 d-flex justify-content-center'; // Centrar la paginación

    const ul = document.createElement('ul');
    ul.className = 'pagination';

    // Botón Anterior
    ul.innerHTML += `
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${paginaActual - 1}">Anterior</a>
        </li>
    `;

    // Botones de Páginas (solo un rango de 5)
    let startPage = Math.max(1, paginaActual - 2);
    let endPage = Math.min(totalPaginas, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
        ul.innerHTML += `
            <li class="page-item ${i === paginaActual ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    // Botón Siguiente
    ul.innerHTML += `
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${paginaActual + 1}">Siguiente</a>
        </li>
    `;

    nav.appendChild(ul);
    
    container.insertAdjacentElement('afterend', nav); 

    // Añadir Listeners 
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

function renderDisponibilidad() {
    const tbody = $('#tablaDisponibilidad');
    const tablaContainer = tbody?.closest('.table-responsive'); 
    
    if (!tbody || !tablaContainer) return console.error("No se encontró el tbody con id 'tablaDisponibilidad'");
    
    tbody.innerHTML = ''; 

    // 1. Filtrar solo los slots de HOY
    const slotsHoy = Disponibilidad
        .filter(d => d.fecha?.split('T')[0] === yyyy_mm_dd)
        .sort((a, b) => a.hora.localeCompare(b.hora));
        
    // 2. Calcular paginación
    totalPaginas = Math.ceil(slotsHoy.length / ITEMS_POR_PAGINA);
    
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    
    // 3. Obtener solo los items de la página actual
    const slotsPagina = slotsHoy.slice(inicio, fin);

    if (slotsPagina.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay disponibilidad para el día de hoy.</td></tr>';
    } else {
        slotsPagina.forEach(d => {
            const estadoNombre = d.estado?.nombre || 'Libre';
            const esLibre = estadoNombre.toLowerCase() === 'libre';
            
            const tr = document.createElement('tr');
            const fechaSlot = d.fecha?.split('T')[0];
            const horaSlot = d.hora.substring(0, 5);
            
            // Usamos <td> y text-center para alinear el botón
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

            tbody.appendChild(tr);

            const btnTomarTurno = tr.querySelector('button');
            if (btnTomarTurno && esLibre) {
                btnTomarTurno.addEventListener('click', () => {
                    abrirModalTurno(d.codDisponibilidad, fechaSlot, horaSlot);
                });
            }
        });
    }

    // 4. Renderizar la paginación después de la tabla
    renderPaginacion(tablaContainer);
}
//  Funciones de Carga de Datos

async function cargarMascotas() {
    try {
        const res = await getAllMascotas(); 
        if (!res.ok) throw new Error('Error al cargar mascotas');
        Mascota = await res.json();
    } catch (err) {
        console.error("Error cargando mascotas:", err);
        Mascota = [];
    }
}

async function cargarTiposAtencion() {
    try {
        const res = await getTiposAtencion();
        if (!res.ok) throw new Error('Error al cargar tipos de atención');
        Tipo_Atencion = await res.json();
    } catch (err) {
        console.error("Error cargando tipos de atención:", err);
        Tipo_Atencion = [];
    }
}

async function cargarDisponibilidad() {
    try {
        const res = await getDisponibilidad();
        
        if (res.status === 404) {
            Disponibilidad = [];
            console.warn("No se encontraron slots de disponibilidad en el servidor (código 404).");
            return; 
        }

        if (!res.ok) {
            // Si no es OK y no es 404, es un error real del servidor.
            throw new Error(`Error ${res.status}: Fallo al cargar la agenda.`);
        }
        
        // 3. Éxito (Código 200)
        Disponibilidad = await res.json();
        console.log("Disponibilidad cargada:", Disponibilidad);

    } catch (err) {
        console.error("Error cargando disponibilidad:", err);
        
        // Mostrar alerta crítica solo para errores graves de conexión/servidor
        Swal.fire({
            title: 'Error de Conexión',
            text: 'No se pudo obtener la agenda de turnos. Revise el estado del servicio.',
            icon: 'error',
            ...SWAL_THEME
        });
        Disponibilidad = [];
    }
}

async function cargarTurnosDisponibles() {
    try {
        const res = await getTurnosDisponibles();
        if (!res.ok) throw new Error(`Error ${res.status}`);
        turnosHoy = turnosDisponibles
        const turnosDisponibles = await res.json(); 
        console.log("Turnos disponibles (para KPI):", turnosDisponibles.length);
    } catch (err) {
        console.error("Error cargando turnos disponibles (solo log):", err);
    }
}

async function cargarTurnosVeterinario() {
    const rawUser = sessionStorage.getItem('dogtorUser');
    if (!rawUser) return;

    const user = JSON.parse(rawUser);
    const codVeterinario = user.id;

    try {
        const res = await getTurnosByVeterinarioId(codVeterinario);

        if (!res.ok) throw new Error(`Error al cargar turnos del veterinario (status ${res.status})`);

        const data = await res.json();
       Turno = data.map(t => ({
    id: t.codAtencion,
    fecha: t.disponibilidadNavigation?.fecha?.split('T')[0] || '',
    hora: t.disponibilidadNavigation?.hora?.substring(0, 5) || '',
    estado: t.disponibilidadNavigation?.estado?.nombre || 'Desconocido',
    id_mascota: t.mascotaNavigation?.codMascota || null,
    id_cliente: t.mascotaNavigation?.cliente?.codCliente || null,
    id_tipo_atencion: t.tipoAtencionNavigation?.codTipoA || null,
    nombreMascota: t.mascotaNavigation?.nombre || '—',
    nombreAtencion: t.tipoAtencionNavigation?.atencion || '—',
    importe: t.importe,
    nombreCliente: t.mascotaNavigation?.cliente
        ? `${t.mascotaNavigation.cliente.nombre} ${t.mascotaNavigation.cliente.apellido}`
        : '—',
    nombreVeterinario: t.codVeterinario ? `Veterinario ${t.codVeterinario}` : 'Sin asignar'
}));

        renderProximos(Turno);

    } catch (err) {
        console.error("Error en cargarTurnosVeterinario:", err);
        Turno = [];
    }
}



async function cargarTurnosProximos() {
    try {
        const res = await getAllAtenciones(); 
        console.log(res)
        if (!res.ok) throw new Error(`Error al cargar turnos (status ${res.status})`);

        const data = await res.json();
        console.log(data)
        Turno = data.map(t => ({
            id: t.codAtencion,
            fecha: t.disponibilidad?.fecha?.split('T')[0] || '',
            hora: t.disponibilidad?.hora?.substring(0, 5) || '',
            
            estado: t.disponibilidad?.codEstadoNavigation?.nombre || t.disponibilidad?.estado?.nombre || 'Desconocido', 
            
            id_mascota: t.mascota?.codMascota || null,
            id_cliente: t.mascota?.cliente?.codCliente || null,
            id_tipo_atencion: t.tipoAtencion?.codTipoA || null,
            nombreMascota: t.mascota?.nombre || '—',
            nombreAtencion: t.tipoAtencion?.atencion || '—',
            importe: t.importe,
            nombreCliente: t.mascota?.cliente
                ? `${t.mascota.cliente.nombre} ${t.mascota.cliente.apellido}`
                : '—',
            nombreVeterinario: t.veterinario?.nombre ? `${t.veterinario.nombre} ${t.veterinario.apellido}` : 'Sin asignar'
        }));

    } catch (err) {
        console.error("Error en cargarTurnosProximos:", err);
        Turno = [];
    }
}

async function guardarTurno(e) {
    e.preventDefault(); 

    const form = e.target;
    const btnGuardar = form.querySelector('button[type="submit"]');
    const alertBox = $('#tAlert');

    // 1. Obtener ID del Veterinario (Usuario actual)
    const rawUser = sessionStorage.getItem('dogtorUser');
    const user = rawUser ? JSON.parse(rawUser) : null;
    const codVeterinario = user?.id;

    alertBox.classList.add('d-none');

    if (!codVeterinario) {
        alertBox.textContent = 'Error: No se pudo identificar al veterinario (cierre y vuelva a iniciar sesión).';
        alertBox.classList.remove('d-none');
        return;
    }

    // 2. Obtener datos del formulario
    const codDisponibilidad = document.getElementById('tCodDisponibilidad')?.value || document.getElementById('tHora')?.value; 
    const codMascota = $('#tMascota').value;
    const codTipoAtencion = $('#tAtencion').value;
    //const estado = $('#tEstado').value;

    // 3. Validación de campos críticos
    if (!codMascota || !codTipoAtencion || !codDisponibilidad) {
        alertBox.classList.add('alert-danger');
        alertBox.classList.remove('alert-success');
        alertBox.textContent = 'Por favor, complete los campos Mascota, Tipo de Atención y Hora.';
        alertBox.classList.remove('d-none');
        return;
    }

    const insertTurnoData = {
        codMascota: parseInt(codMascota),
        CodTipoA: parseInt(codTipoAtencion),
        codVeterinario: codVeterinario,
    };
    
    // Deshabilitar botón y mostrar carga
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';
    alertBox.classList.remove('alert-danger');
    console.log(insertTurnoData);

    // 4. Llamada a la API
    try {
        const res = await createAtencion(insertTurnoData, codDisponibilidad); 
        
       if (res.ok) {
            
            Swal.fire({
                title: '¡Turno Insertado!',
                html: 'El slot ha sido reservado con éxito en la agenda.',
                icon: 'success', 
                background: '#1a202c',
                color: '#BFD4EA', 
                timer: 2500, 
                timerProgressBar: true,
                showConfirmButton: false,
                customClass: {
                    title: 'swal2-title-custom' 
                }
            }).then(() => {
                // 5. Ocultar modal y recargar la dashboard
                const modalElement = document.getElementById('modalTurno');
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
                
                // Recargar datos para actualizar la tabla y los KPIs
                cargarDatos(codVeterinario); 
            });
        } else {
            // Intenta obtener un mensaje de error detallado del cuerpo de la respuesta
            const errorText = await res.text();
            let errorMessage = `Error ${res.status}: Fallo al crear el turno.`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch {}
            throw new Error(errorMessage);
        }
    } catch (err) {
        console.error("Error al guardar turno:", err);
        alertBox.classList.add('alert-danger');
        alertBox.textContent = `Error: ${err.message || 'Error de conexión.'}`;
        alertBox.classList.remove('d-none');
    } finally {
        // Resetear estado del botón
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar';
    }
}

function setupFormTurnoSubmit() {
    const formTurno = $('#formTurno');
    if (formTurno) {
        formTurno.addEventListener('submit', guardarTurno);
    }
}

function setupPerfilMenu() {
    const raw = sessionStorage.getItem('dogtorUser');
    if (!raw) return;

    const user = JSON.parse(raw);
    const perfilBtn = document.getElementById('btnPerfil');
    const dropdownMenu = document.getElementById('menuPerfil');

    if (!perfilBtn || !dropdownMenu) return;

    // Iniciales
    const iniciales = `${(user.nombre?.[0] || 'U')}${(user.apellido?.[0] || 'S')}`.toUpperCase();
    perfilBtn.textContent = iniciales;

    // Toggle menú
    perfilBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    // Cerrar al hacer click afuera
    document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && !perfilBtn.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // Cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    btnCerrarSesion?.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('dogtorUser');
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        window.location.href = '../Pages/index.html';
    });
}

async function cargarDatos(userId) {
    await Promise.all([
        cargarMascotas(),
        cargarTiposAtencion(),
        cargarDisponibilidad(),
        cargarTurnosDisponibles(),
        cargarTurnosProximos()
    ]);
}



function initDashboard() {
    const raw = sessionStorage.getItem('dogtorUser');
    if (!raw) { 
    window.location.href = '../Pages/index.html'; return; }
    const user = JSON.parse(raw);
    
    cargarDatos(user.id).then(() => {
        setearIniciales();
        renderKPIs();
        renderChart();
        cargarTurnosVeterinario()
        renderProximos();
        paginaActualTurnos = 1; // reset página
        renderProximosPaginados();

        setupPerfilMenu();
        renderDisponibilidad();
        setupPerfilMenu();
        setupFormTurnoSubmit();
        cargarTurnosVeterinario();
        setupBusquedaDinamica(); // 💡 Inicializar la lógica de búsqueda por DNI
        renderTopServiciosChart();
    }).catch(err => {
        console.error("Error fatal en initDashboard:", err);
    });
}



function setearIniciales() {
    const badge = $('#avatar') || $('#btnPerfil');
    if (!badge) return;


    const raw = sessionStorage.getItem('dogtorUser');
    let initials = 'US';
    if (raw) {
        try {
            const u = JSON.parse(raw);
            console.log(u)
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

$('#formTurno').addEventListener('submit', async (e) => {
    e.preventDefault();

    const codDisponibilidad = $('#tCodDisponibilidad').value;
    const codMascota = $('#tMascota').value;
    const codTipoAtencion = $('#tAtencion').value;
    
    // Validaciones básicas
    if (!codMascota || !codTipoAtencion) {
        Swal.fire({ title: 'Error', text: 'Seleccione mascota y tipo de atención', icon: 'warning', ...SWAL_THEME });
        return;
    }

    try {
        const body = {
            codDisponibilidad,
            codMascota,
            codTipoAtencion
        };

        const res = await createAtencion(body);
        if (!res.ok) throw new Error(`Error ${res.status}`);

        Swal.fire({ title: 'Turno tomado', text: 'Se ha registrado el turno correctamente.', icon: 'success', ...SWAL_THEME });

        // 🔄 Aquí es donde actualizamos todo
        await cargarTurnosVeterinario();   // Actualiza lista de turnos próximos
        await cargarDisponibilidad();      // Actualiza disponibilidad
        renderDisponibilidad();            // Renderiza la tabla
        renderProximosPaginados();         // Renderiza la lista de turnos próximos con paginación

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance($('#modalTurno'));
        modal?.hide();

    } catch (err) {
        console.error(err);
        Swal.fire({ title: 'Error', text: 'No se pudo tomar el turno', icon: 'error', ...SWAL_THEME });
    }
});

function cargarHorasDisponiblesPorFecha() {
    const inputFecha = document.getElementById('tFecha');
    const selectHora = document.getElementById('tHora');
    const alertBox = document.getElementById('tAlert');
    
    const fechaSeleccionada = inputFecha.value;

    selectHora.innerHTML = '<option value="">Seleccione hora</option>';
    selectHora.disabled = true;

    if (!fechaSeleccionada) return;
    
    // 1. Filtrar los slots disponibles (Libres) para la fecha seleccionada
    // Usamos el array global 'Disponibilidad' que se cargó al inicio.
    const slotsDisponibles = Disponibilidad
        .filter(d => 
            d.fecha.startsWith(fechaSeleccionada) && 
            d.estado?.nombre?.toLowerCase() === 'libre'
        )
        .sort((a, b) => a.hora.localeCompare(b.hora)); 

    // 2. Poblar el Select de Hora
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
        alertBox.classList.add('d-none'); // Ocultar alerta si hay slots
    }
}

// ===== Arranque =====
document.addEventListener('DOMContentLoaded', initDashboard);
import { 
    getAllAtenciones, getMascotaByClienteId, getTiposAtencion, getAllMascotas, createAtencion, getDisponibilidad
} from './api.js';

// ===== Variables globales =====
let Turnos = [];
let TurnosCargados = [];
let Mascotas = [];
let TipoAtencion = [];
let Disponibilidad = [];
let currentPage = 1;
const pageSize = 10; // cantidad de turnos por página
let totalPages = 1;
const SWAL_THEME = {
    background: '#1a202c',
    color: '#BFD4EA',
    confirmButtonColor: '#3498db',
    customClass: { title: 'text-info' }
};
const hoy = new Date();
const yyyy_mm_dd = hoy.toISOString().slice(0, 10);

// ===== Helpers DOM =====
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// === Helpers ===
function formatFecha(fecha) {
    const f = new Date(fecha);
    return f.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function colorEstado(estadoNombre) {
    const estado = (estadoNombre || '').toLowerCase();
    switch (estado) {
        case 'reservado':
        case 'pendiente': return 'warning';
        case 'finalizado':
        case 'atendido': return 'success';
        case 'cancelado': return 'danger';
        case 'libre': return 'info';
        default: return 'secondary';
    }
}

function renderTurnosPaginado(lista) {
    const tbody = $('#tablaTurnos');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-secondary">No se encontraron turnos.</td></tr>`;
        $('#paginacionTurnos').innerHTML = '';
        return;
    }

    totalPages = Math.ceil(lista.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = lista.slice(start, end);

    pageItems.forEach(t => {
        const disp = t.disponibilidadNavigation;
        const tipoA = t.tipoAtencionNavigation;
        const mascota = t.mascotaNavigation;
        const cliente = mascota?.cliente;
        const estadoNombre = disp?.estado?.nombre || 'Desconocido';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatFecha(disp?.fecha)}</td>
            <td>${disp?.hora?.substring(0,5) || '-'}</td>
            <td>${mascota?.nombre || '-'}</td>
            <td>${cliente ? cliente.nombre + ' ' + cliente.apellido : '-'}</td>
            <td>${tipoA?.atencion || '-'}</td>
            <td><span class="badge bg-${colorEstado(estadoNombre)} text-dark">${estadoNombre}</span></td>
            <td><button class="btn btn-sm btn-outline-secondary" disabled>Ver Detalle</button></td>
        `;
        tbody.appendChild(tr);
    });

    renderPaginacion(lista);
}

function renderPaginacion(lista) {
    const tbody = $('#tablaTurnos'); // <--- aquí lo agregamos
    if (!tbody) return;

    const container = $('#paginacionTurnos') || document.createElement('div');
    container.id = 'paginacionTurnos';
    container.className = 'd-flex justify-content-center mt-2 gap-1';

    // Solo append si no existe aún
    if (!$('#paginacionTurnos')) tbody.parentNode.appendChild(container);

    container.innerHTML = '';

    if (totalPages <= 1) return;

    // Botón anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-sm btn-outline-info';
    prevBtn.textContent = '«';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => { currentPage--; renderTurnosPaginado(lista); });
    container.appendChild(prevBtn);

    // Botones de páginas
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `btn btn-sm ${i === currentPage ? 'btn-info text-white' : 'btn-outline-info'}`;
        btn.textContent = i;
        btn.addEventListener('click', () => { currentPage = i; renderTurnosPaginado(lista); });
        container.appendChild(btn);
    }

    // Botón siguiente
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-sm btn-outline-info';
    nextBtn.textContent = '»';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => { currentPage++; renderTurnosPaginado(lista); });
    container.appendChild(nextBtn);
}

// ----------------------------------------------------------------------
// FUNCIONES DE FILTRADO
// ----------------------------------------------------------------------
function filtrarTurnos() {
    const texto = $('#filtroTexto')?.value.toLowerCase().trim() || '';
    const fecha = $('#filtroFecha')?.value || '';
    const estado = $('#filtroEstado')?.value.toLowerCase() || '';

    if (TurnosCargados.length === 0) return;

    const turnosFiltrados = TurnosCargados.filter(t => {
        const disp = t.disponibilidadNavigation;
        const mascota = t.mascotaNavigation;
        const cliente = mascota?.cliente;

        const nombreMascota = (mascota?.nombre || '').toLowerCase();
        const nombreCliente = (cliente ? `${cliente.nombre} ${cliente.apellido}` : '').toLowerCase();
        const cumpleTexto = !texto || nombreMascota.includes(texto) || nombreCliente.includes(texto);

        const fechaTurno = (disp?.fecha || '').startsWith(fecha);
        const cumpleFecha = !fecha || fechaTurno;

        const estadoTurno = (disp?.estado?.nombre || '').toLowerCase();
        const cumpleEstado = !estado || estadoTurno === estado;

        return cumpleTexto && cumpleFecha && cumpleEstado;
    });

    Turnos = turnosFiltrados;
    currentPage = 1; 
    renderTurnosPaginado(Turnos);
    document.getElementById('totalTurnos').textContent = `${Turnos.length} turnos encontrados `;
}

function limpiarFiltros() {
    $('#filtroTexto').value = '';
    $('#filtroFecha').value = '';
    $('#filtroEstado').value = '';
    filtrarTurnos();
}

function setupFiltros() {
    $('#filtroTexto')?.addEventListener('input', filtrarTurnos);
    $('#filtroFecha')?.addEventListener('change', filtrarTurnos);
    $('#filtroEstado')?.addEventListener('change', filtrarTurnos);
    $('#btnLimpiar')?.addEventListener('click', limpiarFiltros);
}


async function cargarDisponibilidad() {
    try {
        const res = await getDisponibilidad();
        if (res.status === 404) {
            Disponibilidad = [];
            return;
        }
        if (!res.ok) throw new Error(`Error ${res.status}`);
        Disponibilidad = await res.json();
    } catch (err) {
        console.error("Error cargando disponibilidad:", err);
        Swal.fire({ title: 'Error de Conexión', text: 'No se pudo obtener la agenda de turnos.', icon: 'error', ...SWAL_THEME });
        Disponibilidad = [];
    }
}

async function cargarCatalogosModal() {
    const resMascotas = await getAllMascotas();
    if (resMascotas.ok) Mascotas = await resMascotas.json();

    const resTiposAtencion = await getTiposAtencion();
    if (resTiposAtencion.ok) {
        TipoAtencion = await resTiposAtencion.json();
        poblarSelectTiposAtencion(TipoAtencion);
    }
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

function cargarHorasDisponiblesPorFecha() {
    const inputFecha = $('#tFecha');
    const selectHora = $('#tHora');
    const alertBox = $('#tAlert');

    selectHora.innerHTML = '<option value="">Seleccione hora</option>';
    selectHora.disabled = true;

    if (!inputFecha.value) return;

    const slotsDisponibles = Disponibilidad
        .filter(d => d.fecha.startsWith(inputFecha.value) && d.estado?.nombre?.toLowerCase() === 'libre')
        .sort((a, b) => a.hora.localeCompare(b.hora));

    if (slotsDisponibles.length === 0) {
        selectHora.innerHTML = '<option value="">No hay horarios libres</option>';
        alertBox.textContent = "No hay horarios libres para la fecha seleccionada.";
        alertBox.classList.remove('d-none');
    } else {
        slotsDisponibles.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.codDisponibilidad;
            opt.textContent = d.hora.substring(0, 5);
            selectHora.appendChild(opt);
        });
        selectHora.disabled = false;
        alertBox.classList.add('d-none');
    }
}


async function guardarTurno(e) {
    e.preventDefault();
    const form = e.target;
    const btnGuardar = form.querySelector('button[type="submit"]');
    const alertBox = $('#tAlert');

    const selectMascota = $('#tMascota');
    const selectedOption = selectMascota.options[selectMascota.selectedIndex];
    if (selectMascota.disabled || !selectedOption || selectedOption.value === "") {
        alertBox.textContent = "Debe buscar y seleccionar una mascota válida.";
        alertBox.classList.add('alert-danger');
        alertBox.classList.remove('d-none');
        return;
    }
    const codMascota = parseInt(selectedOption.value);
    const codDisponibilidad = $('#tHora').value;
    const codTipoAtencion = $('#tAtencion').value;

    if (!codMascota || !codTipoAtencion || !codDisponibilidad || codDisponibilidad === 'Seleccione hora') return;

    const user = JSON.parse(sessionStorage.getItem('dogtorUser') || '{}');
    const insertTurnoData = {
        CodMascota: codMascota,
        CodTipoA: parseInt(codTipoAtencion),
        CodVeterinario: user?.id
    };

    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
        const res = await createAtencion(insertTurnoData, codDisponibilidad);
        if (res.ok) {
            Swal.fire({
                title: '¡Turno Registrado!',
                html: 'La reserva ha sido guardada.',
                icon: 'success',
                timer: 3500,
                timerProgressBar: true,
                showConfirmButton: false,
                ...SWAL_THEME
            }).then(() => {
                bootstrap.Modal.getInstance($('#modalTurno'))?.hide();
                initTurnosPage(user.id); // recarga la tabla
            });
        } else {
            const errorText = await res.text();
            Swal.fire({ title: 'Error al Guardar', text: errorText, icon: 'error', showConfirmButton: true, ...SWAL_THEME });
        }
    } catch (err) {
        console.error(err);
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar';
    }
}

function setupFormTurnoSubmit() {
    $('#formTurno')?.addEventListener('submit', guardarTurno);
}

// ----------------------------------------------------------------------
// BUSQUEDA DE MASCOTAS POR DNI
// ----------------------------------------------------------------------
async function poblarSelectMascotasPorCliente(codCliente) {
    const selectMascota = $('#tMascota');
    const inputTutor = $('#tTutor');
    const statusDiv = $('#tTutorDniStatus');

    selectMascota.innerHTML = '<option value="">Seleccione mascota...</option>';
    selectMascota.disabled = true;
    inputTutor.value = '';
    statusDiv.textContent = 'Buscando mascotas...';

    if (!codCliente || isNaN(codCliente)) {
        statusDiv.textContent = 'Ingrese un DNI válido.';
        return;
    }

    try {
        const res = await getMascotaByClienteId(codCliente);
        if (res.ok) {
            const mascotasCliente = await res.json();
            if (!mascotasCliente.length) {
                statusDiv.textContent = 'No se encontraron mascotas activas.';
                return;
            }

            mascotasCliente.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.codMascota;
                opt.textContent = m.nombre;
                selectMascota.appendChild(opt);
            });

            const cliente = mascotasCliente[0].codClienteNavigation || mascotasCliente[0].cliente;
            inputTutor.value = cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Tutor encontrado';
            selectMascota.disabled = false;
            statusDiv.textContent = `Mascotas encontradas para ${inputTutor.value}.`;
        } else {
            statusDiv.textContent = 'Cliente no encontrado o sin mascotas.';
        }
    } catch (err) {
        console.error(err);
        statusDiv.textContent = 'Error de conexión.';
    }
}

function setupBusquedaDinamica() {
    $('#btnBuscarCliente')?.addEventListener('click', () => {
        const dni = parseInt($('#tTutorDni').value.trim());
        if (!isNaN(dni) && dni > 0) poblarSelectMascotasPorCliente(dni);
        else $('#tTutorDniStatus').textContent = 'Ingrese un DNI válido.';
    });

    $('#tFecha')?.addEventListener('change', cargarHorasDisponiblesPorFecha);
}

function renderTurnos(lista) {
    const tbody = $('#tablaTurnos');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-secondary">No se encontraron turnos.</td></tr>`;
        return;
    }

    lista.forEach(t => {
        const disp = t.disponibilidadNavigation;
        const tipoA = t.tipoAtencionNavigation;
        const mascota = t.mascotaNavigation;
        const cliente = mascota?.cliente;
        const estadoNombre = disp?.estado?.nombre || 'Desconocido';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatFecha(disp?.fecha)}</td>
            <td>${disp?.hora?.substring(0,5) || '-'}</td>
            <td>${mascota?.nombre || '-'}</td>
            <td>${cliente ? cliente.nombre + ' ' + cliente.apellido : '-'}</td>
            <td>${tipoA?.atencion || '-'}</td>
            <td><span class="badge bg-${colorEstado(estadoNombre)} text-dark">${estadoNombre}</span></td>
            <td><button class="btn btn-sm btn-outline-secondary" disabled>Ver Detalle</button></td>
        `;
        tbody.appendChild(tr);
    });
}


async function initTurnosPage(userId) {
    await cargarDisponibilidad();
    await cargarCatalogosModal();
    setupModalLogic();
    setupBusquedaDinamica();
    setupFormTurnoSubmit();
    setupFiltros();

    try {
        const res = await getAllAtenciones(userId);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        TurnosCargados = await res.json();
        Turnos = [...TurnosCargados];
        renderTurnosPaginado(Turnos);
        document.getElementById('totalTurnos').textContent = `${Turnos.length} turnos encontrados - mostrando 10 por página`;
    } catch (err) {
        console.error(err);
        Swal.fire({ title: 'Error', text: 'No se pudieron cargar los turnos.', icon: 'error', ...SWAL_THEME });
    }
}

function setupModalLogic() {
    const modal = $('#modalTurno');
    if (!modal) return;
    modal.addEventListener('hidden.bs.modal', () => {
        $('#formTurno')?.reset();
        $('#tMascota').disabled = true;
        $('#tTutorDniStatus').textContent = '';
        $('#tAlert').classList.add('d-none');
        $('#tAlert').classList.remove('alert-danger');
    });
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

    // Toggle menú al hacer click
    perfilBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('d-none');
    });

    // Cerrar menú al hacer click afuera
    document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && !perfilBtn.contains(e.target)) {
            dropdownMenu.classList.add('d-none');
        }
    });

    // Botón de cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    btnCerrarSesion?.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('dogtorUser');
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        window.location.href = './index.html'; // o ruta correcta de login
    });
}


document.addEventListener('DOMContentLoaded', () => {
    setupPerfilMenu();

    const user = JSON.parse(sessionStorage.getItem('dogtorUser') || '{}');
    if (user?.id) initTurnosPage(user.id);
});


import { 
    getAllAtenciones, getMascotaByClienteId, actualizarEstadoTurno, 
    getTiposAtencion, getAllMascotas, createAtencion, getDisponibilidad
} from './api.js';

// ===== Variables globales =====
let Turnos = [];
let TurnosCargados = [];
let Mascotas = [];
let TipoAtencion = [];
let Disponibilidad = [];
let currentPage = 1;
const pageSize = 10;
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

// ===== Helpers =====
function formatFecha(fecha) {
    const f = new Date(fecha);
    return f.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function normalizarEstado(nombre) {
    console.log("pene ", nombre)
    if (!nombre) return '';
        console.log("pene entro", nombre)

    nombre = nombre.toLowerCase();
    if (nombre === 'atendido') return 'finalizado'; // normalizamos

    return nombre;
}

function getEstadoCodigo(nombre) {
    switch (nombre) {
        case 'Libre': return 1;
        case 'Reservado': return 2;
        case 'Finalizado': return 3;
        case 'Cancelado': return 4;
        default: return null;
    }
}
function colorEstado(estadoNombre) {
    const estado = normalizarEstado(estadoNombre);
    switch (estado) {
        case 'reservado':
        case 'pendiente': return 'warning';
        case 'finalizado': return 'success';
        case 'cancelado': return 'danger';
        case 'libre': return 'info';
        default: return 'secondary';
    }
}

// ===== Render de turnos =====
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
        const estadoNombre = normalizarEstado(disp?.estado?.nombre) || 'Desconocido';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatFecha(disp?.fecha)}</td>
            <td>${disp?.hora?.substring(0,5) || '-'}</td>
            <td>${mascota?.nombre || '-'}</td>
            <td>${cliente ? cliente.nombre + ' ' + cliente.apellido : '-'}</td>
            <td>${tipoA?.atencion || '-'}</td>
            <td class="position-relative">
                <span class="badge bg-${colorEstado(estadoNombre)} text-dark me-2 animate__animated animate__pulse">${estadoNombre}</span>
                <button class="btn btn-sm btn-outline-secondary btnEditarEstado" 
                        data-coddisponibilidad="${disp?.codDisponibilidad}" 
                        data-estadoactual="${estadoNombre}" 
                        title="Editar estado">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    setupEditarEstadoButtons();
    renderPaginacion(lista);
}

function renderPaginacion(lista) {
    const tbody = $('#tablaTurnos');
    if (!tbody) return;

    const container = $('#paginacionTurnos') || document.createElement('div');
    container.id = 'paginacionTurnos';
    container.className = 'd-flex justify-content-center mt-2 gap-1';
    if (!$('#paginacionTurnos')) tbody.parentNode.appendChild(container);

    container.innerHTML = '';
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-sm btn-outline-info';
    prevBtn.textContent = '«';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => { currentPage--; renderTurnosPaginado(lista); });
    container.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `btn btn-sm ${i === currentPage ? 'btn-info text-white' : 'btn-outline-info'}`;
        btn.textContent = i;
        btn.addEventListener('click', () => { currentPage = i; renderTurnosPaginado(lista); });
        container.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-sm btn-outline-info';
    nextBtn.textContent = '»';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => { currentPage++; renderTurnosPaginado(lista); });
    container.appendChild(nextBtn);
}

// ===== Editar estado de turno =====
function setupEditarEstadoButtons() {
    $$('.btnEditarEstado').forEach(btn => {
        btn.addEventListener('click', async () => {
            const codDisp = btn.dataset.coddisponibilidad;
            const estadoActual = normalizarEstado(btn.dataset.estadoactual);

            const estados = {
                1: 'Libre',
                2: 'Reservado',
                3: 'Finalizado',
                4: 'Cancelado'
            };

            const { value: nuevoEstado } = await Swal.fire({
                title: 'Cambiar estado del turno',
                input: 'select',
                inputOptions: estados,
                inputPlaceholder: estados[getEstadoCodigo(estadoActual)] || 'Selecciona un estado',
                background: '#1a202c',
                color: '#BFD4EA',
                confirmButtonColor: '#3498db',
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar',
                didOpen: () => {
                    const select = Swal.getInput();
                    select.style.backgroundColor = '#111827';
                    select.style.color = '#BFD4EA';
                    select.style.border = '1px solid #3498db';
                    select.style.borderRadius = '8px';
                    select.style.padding = '6px';
                    select.style.transition = 'all 0.3s';
                    select.addEventListener('focus', () => (select.style.borderColor = '#4fd1c5'));
                    select.addEventListener('blur', () => (select.style.borderColor = '#3498db'));
                }
            });

            if (!nuevoEstado || parseInt(nuevoEstado) === getEstadoCodigo(estadoActual)) return;

            try {
                const res = await actualizarEstadoTurno(codDisp, nuevoEstado);
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al actualizar',
                        text: data.message || 'No se pudo actualizar el estado del turno.',
                        background: '#1a202c',
                        color: '#BFD4EA',
                        confirmButtonColor: '#3498db'
                    });
                    return;
                }

                const badge = btn.closest('td').querySelector('.badge');
                const nombreNuevo = estados[nuevoEstado];
                badge.textContent = nombreNuevo;
                badge.className = `badge bg-${colorEstado(nombreNuevo)} text-dark me-2 animate__animated animate__pulse`;

                Swal.fire({
                    icon: 'success',
                    title: '¡Estado actualizado!',
                    text: `El turno fue marcado como "${nombreNuevo}".`,
                    background: '#1a202c',
                    color: '#BFD4EA',
                    timer: 1800,
                    showConfirmButton: false
                });

            } catch (err) {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo conectar con el servidor.',
                    background: '#1a202c',
                    color: '#BFD4EA'
                });
            }
        });
    });
}

// ===== Filtros =====
function filtrarTurnos() {
    const texto = ($('#filtroTexto')?.value || '').toLowerCase().trim();
    const fecha = $('#filtroFecha')?.value || '';
    const estadoFiltro = ($('#filtroEstado')?.value || '').toLowerCase().trim();

    if (!TurnosCargados.length) return;

    let turnosFiltrados = TurnosCargados.filter(t => {
        const disp = t.disponibilidadNavigation;
        const mascota = t.mascotaNavigation;
        const cliente = mascota?.cliente;

        // Texto
        const nombreMascota = (mascota?.nombre || '').toLowerCase();
        const nombreCliente = (cliente ? `${cliente.nombre} ${cliente.apellido}` : '').toLowerCase();
        const cumpleTexto = !texto || nombreMascota.includes(texto) || nombreCliente.includes(texto);

        // Fecha
        const fechaTurno = (disp?.fecha || '').startsWith(fecha);
        const cumpleFecha = !fecha || fechaTurno;

        // Estado
        const estadoTurno = normalizarEstado(disp?.estado?.nombre || '').trim().toLowerCase();
        const cumpleEstado = !estadoFiltro || estadoTurno === estadoFiltro;

        console.log("Filtro:", estadoFiltro, "Turno:", estadoTurno, "Cumple:", cumpleEstado);

        return cumpleTexto && cumpleFecha && cumpleEstado;
    });

    turnosFiltrados = aplicarFiltroVeterinario(turnosFiltrados);
    Turnos = turnosFiltrados;
    currentPage = 1;
    renderTurnosPaginado(Turnos);
    $('#totalTurnos').textContent = `${Turnos.length} turnos encontrados`;
}
function aplicarFiltroVeterinario(turnos) {
    const user = JSON.parse(sessionStorage.getItem('dogtorUser') || '{}');
    const soloMisTurnos = $('#chkSoloMisTurnos')?.checked;

    if (!soloMisTurnos || !user?.id) return turnos;
    return turnos.filter(t => t.codVeterinario === user.id);
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
    $('#chkSoloMisTurnos')?.addEventListener('change', filtrarTurnos);
    $('#btnLimpiar')?.addEventListener('click', limpiarFiltros);
}

// ===== Disponibilidad y catalogos =====
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
        Swal.fire({ title: 'Error de Conexion', text: 'No se pudo obtener la agenda de turnos.', icon: 'error', ...SWAL_THEME });
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
    select.innerHTML = '<option value="">Seleccione tipo de atencion</option>';
    tipos.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.codTipoA;
        opt.textContent = t.atencion;
        select.appendChild(opt);
    });
}

// ===== Horas disponibles =====
function cargarHorasDisponiblesPorFecha() {
    const inputFecha = $('#tFecha');
    const selectHora = $('#tHora');
    const alertBox = $('#tAlert');

    selectHora.innerHTML = '<option value="">Seleccione hora</option>';
    selectHora.disabled = true;
    if (!inputFecha.value) return;

    const slotsDisponibles = Disponibilidad
        .filter(d => d.fecha.startsWith(inputFecha.value) && normalizarEstado(d.estado?.nombre) === 'libre')
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

// ===== Guardar turno =====
async function guardarTurno(e) {
    e.preventDefault();
    const form = e.target;
    const btnGuardar = form.querySelector('button[type="submit"]');
    const alertBox = $('#tAlert');

    const selectMascota = $('#tMascota');
    const selectedOption = selectMascota.options[selectMascota.selectedIndex];
    if (selectMascota.disabled || !selectedOption || selectedOption.value === "") {
        alertBox.textContent = "Debe buscar y seleccionar una mascota valida.";
        alertBox.classList.add('alert-danger');
        alertBox.classList.remove('d-none');
        return;
    }

    const codMascota = parseInt(selectedOption.value);
    const codDisponibilidad = $('#tHora').value;
    const codTipoAtencion = $('#tAtencion').value;
    if (!codMascota || !codTipoAtencion || !codDisponibilidad) return;

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
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false,
                ...SWAL_THEME
            }).then(() => {
                bootstrap.Modal.getInstance($('#modalTurno'))?.hide();
                initTurnosPage(user.id);
            });
        } else {
            let errorText = 'Error desconocido';
            try {
                const json = await res.json();
                errorText = json.message || errorText;
            } catch {
                errorText = await res.text();
            }
            Swal.fire({ title: 'Error al Guardar', text: errorText, icon: 'error', showConfirmButton: true, ...SWAL_THEME });
        }
    } catch (err) {
        console.error(err);
        Swal.fire({ title: 'Error al Guardar', text: err.message || 'Error desconocido', icon: 'error', showConfirmButton: true, ...SWAL_THEME });
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar';
    }
}

function setupFormTurnoSubmit() {
    $('#formTurno')?.addEventListener('submit', guardarTurno);
}

// ===== Búsqueda de mascotas =====
async function poblarSelectMascotasPorCliente(codCliente) {
    const selectMascota = $('#tMascota');
    const inputTutor = $('#tTutor');
    const statusDiv = $('#tTutorDniStatus');

    selectMascota.innerHTML = '<option value="">Seleccione mascota...</option>';
    selectMascota.disabled = true;
    inputTutor.value = '';
    statusDiv.textContent = 'Buscando mascotas...';

    if (!codCliente || isNaN(codCliente)) {
        statusDiv.textContent = 'Ingrese un DNI valido.';
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
        statusDiv.textContent = 'Error de conexion.';
    }
}

function setupBusquedaDinamica() {
    $('#btnBuscarCliente')?.addEventListener('click', () => {
        const dni = parseInt($('#tTutorDni').value.trim());
        if (!isNaN(dni) && dni > 0) poblarSelectMascotasPorCliente(dni);
        else $('#tTutorDniStatus').textContent = 'Ingrese un DNI valido.';
    });
    $('#tFecha')?.addEventListener('change', cargarHorasDisponiblesPorFecha);
}
function hideLoader() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
    }
}
function showLoader() {
    let overlay = document.getElementById('loading-overlay');
    
    // Si no existe, lo creamos y lo añadimos al body
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        
        // Incluimos el logo y el efecto de escaneo
        overlay.innerHTML = `
            <img src="../Assets/logo2.png" alt="Dogtor Logo" class="loader-logo">
            <div class="loader-container">
                <div class="loader-bar"></div>
            </div>
            <div class="loading-text">Cargando...</div>
        `;
        document.body.appendChild(overlay);
    }
    
    requestAnimationFrame(() => {
        overlay.classList.add('visible');
    });
}

// ===== Inicialización =====
async function initTurnosPage(codVeterinario) {
    showLoader();
    try {
        const res = await getAllAtenciones();
        if (!res.ok) throw new Error('Error al cargar turnos');
        const turnos = await res.json();
        TurnosCargados = turnos;
        Turnos = turnos.filter(t => !codVeterinario || t.codVeterinario === codVeterinario);
        currentPage = 1;
        renderTurnosPaginado(Turnos);
    } catch (err) {
        console.error(err);
        Swal.fire({ title: 'Error', text: 'No se pudo cargar la lista de turnos', icon: 'error', ...SWAL_THEME });
    }
    finally {

        hideLoader();
    }
}

// ===== Ejecutar al cargar =====
document.addEventListener('DOMContentLoaded', async () => {
    await cargarDisponibilidad();
    await cargarCatalogosModal();
    setupFiltros();
    setupFormTurnoSubmit();
    setupBusquedaDinamica();
    initTurnosPage();
});

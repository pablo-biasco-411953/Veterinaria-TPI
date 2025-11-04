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
const btnPerfil = document.getElementById('btnPerfil');
const menuPerfil = document.getElementById('menuPerfil');

btnPerfil.addEventListener('click', () => {
    menuPerfil.classList.toggle('d-none');
});

document.addEventListener('click', (e) => {
    if (!btnPerfil.contains(e.target) && !menuPerfil.contains(e.target)) {
        menuPerfil.classList.add('d-none');
    }
});


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
    if (!nombre) return '';

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
    const tableContainer = tbody?.closest('.table-responsive');
    if (!tbody || !tableContainer) return;

    tbody.innerHTML = '';

    if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-secondary">No se encontraron turnos.</td></tr>`;
        $('#paginacionTurnos')?.remove();
        $('#totalTurnos').textContent = '0 turnos encontrados';
        return;
    }

    totalPages = Math.ceil(lista.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = lista.slice(start, end);

    pageItems.forEach((t, index) => {
        const disp = t.disponibilidadNavigation;
        const tipoA = t.tipoAtencionNavigation;
        const mascota = t.mascotaNavigation;
        const cliente = mascota?.cliente;
        const estadoNombre = disp?.estado?.nombre || 'Desconocido';
        const estadoNormalizado = normalizarEstado(estadoNombre);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatFecha(disp?.fecha)}</td>
            <td>${disp?.hora?.substring(0,5) || '-'}</td>
            <td>${mascota?.nombre || '-'}</td>
            <td>${cliente ? cliente.nombre + ' ' + cliente.apellido : '-'}</td>
            <td>${tipoA?.atencion || '-'}</td>
            <td class="position-relative">
                <span class="badge bg-${colorEstado(estadoNormalizado)} text-dark me-2 animate__animated animate__pulse">${estadoNormalizado.charAt(0).toUpperCase() + estadoNormalizado.slice(1)}</span>
                <button class="btn btn-sm btn-outline-secondary btnEditarEstado" 
                        data-coddisponibilidad="${disp?.codDisponibilidad}" 
                        data-estadoactual="${estadoNombre}" 
                        title="Editar estado">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;

        // Añadimos la animación flotante con delay escalonado
        tr.classList.add('float-in');
        tr.style.animationDelay = `${index * 50}ms`; // cada fila 50ms más tarde

        tbody.appendChild(tr);
    });

    setupEditarEstadoButtons();
    renderPaginacion(lista);
    $('#totalTurnos').textContent = `${lista.length} turnos encontrados`;

}


function renderPaginacion(lista) {
    const tableContainer = $('#tablaTurnos')?.closest('.table-responsive');
    const cardContainer = tableContainer?.closest('.card'); // El contenedor padre de la tabla
    if (!tableContainer || !cardContainer) return;

    // Removemos la paginación anterior si existe
    $('#paginacionTurnos')?.remove();

    // 1. Crear el contenedor principal
    const navContainer = document.createElement('div');
    navContainer.id = 'paginacionTurnos';
    // Usamos padding vertical y centralizamos, ajustando el margin superior para separarlo visualmente
    navContainer.className = 'd-flex justify-content-center pt-3 pb-3 border-top border-secondary-subtle'; 
    
    const ul = document.createElement('ul');
    // Usamos las clases de Bootstrap para paginación
    ul.className = 'pagination pagination-sm justify-content-center mb-0';

    if (totalPages <= 1) return;

    // 2. Botón Anterior (<<)
    ul.innerHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>`;

    // Lógica para mostrar solo un rango de páginas (máx 5 botones)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // 3. Botones de Números
    for (let i = startPage; i <= endPage; i++) {
        ul.innerHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                            <a class="page-link" href="#" data-page="${i}">${i}</a>
                        </li>`;
    }

    // 4. Botón Siguiente (>>)
    ul.innerHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>`;

    navContainer.appendChild(ul);
    
    // 5. Insertar la paginación DENTRO del contenedor 'card', pero DESPUÉS del 'table-responsive'
    // Esto asegura que la paginación esté correctamente marginada y formateada dentro de la tarjeta.
    cardContainer.appendChild(navContainer);

    // 6. Configurar Event Listeners
    navContainer.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newPage = parseInt(e.currentTarget.dataset.page);
            if (newPage > 0 && newPage <= totalPages && newPage !== currentPage) {
                currentPage = newPage; 
                renderTurnosPaginado(lista);
            }
        });
    });
}

// ===== Editar estado de turno =====
function setupEditarEstadoButtons() {
    $$('.btnEditarEstado').forEach(btn => {
        btn.addEventListener('click', async () => {
            const codDisp = btn.dataset.coddisponibilidad;
            const estadoActualNombre = btn.dataset.estadoactual;
            const estadoActualCodigo = getEstadoCodigo(estadoActualNombre);

            const estados = {
                1: 'Libre',
                2: 'Reservado',
                3: 'Finalizado',
                4: 'Cancelado'
            };

            const { value: nuevoEstadoCodigo } = await Swal.fire({
                title: 'Cambiar estado del turno',
                input: 'select',
                inputOptions: estados,
                inputPlaceholder: estados[estadoActualCodigo] || 'Selecciona un estado',
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

            if (!nuevoEstadoCodigo) return; // Cancelado por el usuario
            
            const nuevoEstadoParsed = parseInt(nuevoEstadoCodigo);

            // Validación: Mismo Estado
            if (nuevoEstadoParsed === estadoActualCodigo) {
                Swal.fire({
                    icon: 'warning',
                    title: '¡Atención!',
                    text: 'No se puede cambiar al mismo estado.',
                    background: '#1a202c',
                    color: '#BFD4EA',
                    confirmButtonColor: '#3498db'
                });
                return;
            }

            try {
                const res = await actualizarEstadoTurno(codDisp, nuevoEstadoParsed);
                
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
                
                // Si la actualización es exitosa, notificamos y recargamos la grilla
                Swal.fire({
                    icon: 'success',
                    title: '¡Estado actualizado!',
                    text: `El turno fue marcado como "${estados[nuevoEstadoParsed]}". Recargando lista...`,
                    background: '#1a202c',
                    color: '#BFD4EA',
                    timer: 1800,
                    showConfirmButton: false
                }).then(() => {
                     // Recargar la grilla desde el servidor para reflejar el cambio
                     initTurnosPage(); 
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

    if (!TurnosCargados.length) {
        Turnos = [];
        currentPage = 1;
        renderTurnosPaginado(Turnos);
        return;
    }

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

        return cumpleTexto && cumpleFecha && cumpleEstado;
    });

    turnosFiltrados = aplicarFiltroVeterinario(turnosFiltrados);
    Turnos = turnosFiltrados;
    currentPage = 1;
    renderTurnosPaginado(Turnos);
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
    // El checkbox se mantiene chequeado, ya que el HTML lo define así por defecto
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
async function initTurnosPage() {
    showLoader();
    const rawUser = sessionStorage.getItem('dogtorUser');
    const user = rawUser ? JSON.parse(rawUser) : {};
    const codVeterinario = user.id;
    
    try {
        const res = await getAllAtenciones();
        if (!res.ok) throw new Error('Error al cargar turnos');
        const turnos = await res.json();
        TurnosCargados = turnos;
        
        // Aplicar el filtro "Solo mis turnos" inmediatamente al cargar, 
        // ya que el checkbox está checked por defecto en el HTML.
        Turnos = aplicarFiltroVeterinario(TurnosCargados);
        
        currentPage = 1;
        renderTurnosPaginado(Turnos);
    } catch (err) {
        console.error(err);
        Swal.fire({ title: 'Error', text: 'No se pudo cargar la lista de turnos', icon: 'error', ...SWAL_THEME });
    }
    finally {
        setearIniciales()
        hideLoader();
    }
}
 
// Cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    btnCerrarSesion?.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('dogtorUser');
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        window.location.href = '../Pages/index.html';
    });


// ===== Ejecutar al cargar =====
document.addEventListener('DOMContentLoaded', async () => {
    await cargarDisponibilidad();
    await cargarCatalogosModal();
    setupFiltros();
    setupFormTurnoSubmit();
    setupBusquedaDinamica();
    initTurnosPage();
});

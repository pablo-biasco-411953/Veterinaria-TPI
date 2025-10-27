// turnos.js
import { 
    getAllAtenciones, getMascotaByClienteId ,getTiposAtencion, getAllMascotas, getTiposMascota, createAtencion, getDisponibilidad
} from './api.js';

// ===== Variables globales =====
let Turnos = []; 
let TurnosCargados = []; // Mantendrá la lista completa (fuente de verdad)
let Mascotas = []; 
let TipoAtencion = []; 
let Disponibilidad = []; 

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
    const estado = estadoNombre.toLowerCase(); 
    
    switch (estado) {
        case 'reservado':
        case 'pendiente': 
            return 'warning'; 
        case 'finalizado':
        case 'atendido': 
            return 'success'; 
        case 'cancelado': 
            return 'danger'; 
        case 'libre': 
            return 'info'; 
        default: 
            return 'secondary'; 
    }
}

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

// ----------------------------------------------------------------------
// FUNCIONES DE FILTRADO (NUEVO)
// ----------------------------------------------------------------------

/**
 * Aplica los filtros actuales (texto, fecha, estado) a la lista completa de turnos.
 */
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

setearIniciales();
function filtrarTurnos() {
    const texto = $('#filtroTexto')?.value.toLowerCase().trim() || '';
    const fecha = $('#filtroFecha')?.value || '';
    const estado = $('#filtroEstado')?.value.toLowerCase() || '';

    if (TurnosCargados.length === 0) return;

    const turnosFiltrados = TurnosCargados.filter(t => {
        const disp = t.disponibilidadNavigation;
        const mascota = t.mascotaNavigation;
        const cliente = mascota?.cliente;

        // 1. Filtro de Texto (Mascota o Cliente)
        const nombreMascota = (mascota?.nombre || '').toLowerCase();
        const nombreCliente = (cliente ? `${cliente.nombre} ${cliente.apellido}` : '').toLowerCase();
        const cumpleTexto = !texto || nombreMascota.includes(texto) || nombreCliente.includes(texto);

        // 2. Filtro de Fecha
        const fechaTurno = (disp?.fecha || '').startsWith(fecha);
        const cumpleFecha = !fecha || fechaTurno;

        // 3. Filtro de Estado
        const estadoTurno = (disp?.estado?.nombre || '').toLowerCase();
        const cumpleEstado = !estado || estadoTurno === estado;

        return cumpleTexto && cumpleFecha && cumpleEstado;
    });

    Turnos = turnosFiltrados; 
    renderTurnos(Turnos);
    document.getElementById('totalTurnos').textContent = `${Turnos.length} turnos encontrados`;
}
/**
 * Limpia los campos de filtro y ejecuta el filtrado (mostrando todos los turnos).
 */
function limpiarFiltros() {
    $('#filtroTexto').value = '';
    $('#filtroFecha').value = '';
    $('#filtroEstado').value = '';
    filtrarTurnos();
}

/**
 * Asigna los Event Listeners a los campos de filtro.
 */
function setupFiltros() {
    const filtroTexto = $('#filtroTexto');
    const filtroFecha = $('#filtroFecha');
    const filtroEstado = $('#filtroEstado');
    const btnLimpiar = $('#btnLimpiar');

    // 💡 Conexión de los eventos al filtro
    filtroTexto?.addEventListener('input', filtrarTurnos);
    filtroFecha?.addEventListener('change', filtrarTurnos);
    filtroEstado?.addEventListener('change', filtrarTurnos);
    btnLimpiar?.addEventListener('click', limpiarFiltros);
}


// ----------------------------------------------------------------------
// FUNCIONES DE CARGA Y POBLACIÓN DE SELECTS
// ----------------------------------------------------------------------

async function cargarDisponibilidad() {
    try {
        const res = await getDisponibilidad(); 
        
        if (res.status === 404) {
            Disponibilidad = [];
            console.warn("No se encontraron slots de disponibilidad en el servidor (código 404).");
            return;
        }

        if (!res.ok) {
            throw new Error(`Error ${res.status}: Fallo al cargar la agenda.`);
        }
        
        Disponibilidad = await res.json();
    } catch (err) {
        console.error("Error cargando disponibilidad:", err);
        Swal.fire({ title: 'Error de Conexión', text: 'No se pudo obtener la agenda de turnos.', icon: 'error', ...SWAL_THEME });
        Disponibilidad = [];
    }
}

async function cargarCatalogosModal() {
    // 1. Cargar Mascotas
    const resMascotas = await getAllMascotas(); 
    if (resMascotas.ok) { Mascotas = await resMascotas.json(); }

    // 2. Cargar Tipos de Atención
    const resTiposAtencion = await getTiposAtencion(); 
    if (resTiposAtencion.ok) { TipoAtencion = await resTiposAtencion.json(); poblarSelectTiposAtencion(TipoAtencion); }
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

// ----------------------------------------------------------------------
// LÓGICA DE EVENTOS Y FORMULARIO
// ----------------------------------------------------------------------

async function guardarTurno(e) {
    e.preventDefault(); 
    const form = e.target;
    const btnGuardar = form.querySelector('button[type="submit"]');
    const alertBox = $('#tAlert');

    // ... (Obtención de codVeterinario y modoExistente) ...

    let codMascota;
    const codDisponibilidad = document.getElementById('tHora')?.value; 
    const codTipoAtencion = $('#tAtencion').value;

    // ⚠️ Lógica Cliente/Mascota Existente (CORREGIDA)
   
        const selectMascota = $('#tMascota'); // Obtenemos el select aquí
        const selectedOption = selectMascota.options[selectMascota.selectedIndex];

        // 💡 VERIFICACIÓN ROBUSTA: Si no hay selección válida O el select está deshabilitado
        if (selectMascota.disabled || !selectedOption || selectedOption.value === "") {
            alertBox.textContent = "Debe buscar y seleccionar una mascota válida.";
            alertBox.classList.add('alert-danger');
            alertBox.classList.remove('d-none');
            return;
        }
        codMascota = parseInt(selectedOption.value); // Leemos el valor de la opción
    
    
    // 3. Validación de campos críticos
    if (!codMascota || !codTipoAtencion || !codDisponibilidad || codDisponibilidad === 'Seleccione hora') {
        // ... (Mostrar error) ...
        return;
    }
    const rawUser = sessionStorage.getItem('dogtorUser');
    const user = rawUser ? JSON.parse(rawUser) : null;
    // 💡 CONSTRUCCIÓN DEL PAYLOAD (sin cambios)
    const insertTurnoData = {
        CodMascota: codMascota, // Ya es un int válido aquí
        CodTipoA: parseInt(codTipoAtencion),
        CodVeterinario: user?.id,
    };
    
    // Deshabilitar botón
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    // 4. Llamada a la API
    try {
        const res = await createAtencion(insertTurnoData, codDisponibilidad); 
        
        if (res.ok) {
            // 🚀 ÉXITO: SWEETALERT2
            Swal.fire({
                title: '¡Turno Registrado!',
                html: 'La reserva ha sido guardada.',
                icon: 'success',
                timer: 3500,
                timerProgressBar: true,
                showConfirmButton: false,
                ...SWAL_THEME
            }).then(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalTurno'));
                if (modal) modal.hide();
                cargarDatos(codVeterinario); // Recarga la tabla principal
            });

        } else {
            const errorText = await res.text();
            let errorMessage = `Error ${res.status}: Fallo al crear el turno.`;
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch {}
            
            Swal.fire({ title: 'Error al Guardar', text: errorMessage, icon: 'error', showConfirmButton: true, ...SWAL_THEME });
        }
    } catch (err) {
        console.error("Error al guardar turno:", err);
    } finally {
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
        // Llama a la API con el CodCliente obtenido del DNI (asumido)
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
                opt.textContent = m.nombre; // Asumo 'nombre' de la mascota
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

// === Renderizar tabla principal ===
function renderTurnos(lista) {
    const tbody = document.getElementById('tablaTurnos');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-secondary">No se encontraron turnos.</td></tr>`;
        return;
    }

    lista.forEach(t => {
        // 💡 Acceso a las propiedades de Navegación (CodDisponibilidadNavigation)
        const disp = t.disponibilidadNavigation; 
        const tipoA = t.tipoAtencionNavigation; 
        const mascota = t.mascotaNavigation;
        const cliente = mascota?.cliente;

        // 💡 Acceso al estado anidado
        const estadoNombre = disp?.estado?.nombre || 'Desconocido';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatFecha(disp?.fecha)}</td> 
            <td>${disp?.hora?.substring(0, 5) || '-'}</td>
            <td>${mascota?.nombre || '-'}</td>
            <td>${cliente ? cliente.nombre + ' ' + cliente.apellido : '-'}</td>
            <td>${tipoA?.atencion || '-'}</td>
            
            <td>
                <span class="badge bg-${colorEstado(estadoNombre)} text-dark">
                    ${estadoNombre}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-secondary" disabled>Ver Detalle</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}




function setupModalLogic() {
    const bloqueExistente = $('#bloqueExistente');
    const bloqueNuevo = $('#bloqueNuevo');
    const modoRadios = $$('input[name="modoAlta"]');
    
    if (!bloqueExistente || !bloqueNuevo || !modoRadios.length) return;

    const toggleBlocks = (esNuevo) => {
        if (esNuevo) {
            bloqueExistente.classList.add('d-none');
            bloqueNuevo.classList.remove('d-none');
        } else {
            bloqueExistente.classList.remove('d-none');
            bloqueNuevo.classList.add('d-none');
        }
    };

    modoRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            toggleBlocks(e.target.value === 'nuevo');
        });
    });

    // Inicializar el modal con el bloque existente
    // Comentar o cambiar esta línea si hay un input radio para el modo
    // toggleBlocks($('#modoNuevo').checked); 
}

async function cargar() {
    // 💡 Esta función se encarga de llamar a todas las cargas asíncronas
    await Promise.all([
        cargarDisponibilidad(),
   
    ]);
}

async function initTurnosPage(userId) {
    // 1. Carga de datos para el modal y listado (Catálogos y Disponibilidad)
    await Promise.all([
        cargarDisponibilidad(),
        cargarCatalogosModal()
    ]);
    
    // 2. Cargamos los turnos principales y hacemos copia de seguridad
    try {
        const res = await getAllAtenciones();
        if (!res.ok) throw new Error('Error al obtener turnos');
        const turnos = await res.json();
        
        TurnosCargados = turnos; // Copia de seguridad
        Turnos = turnos; // Lista inicial
        
        renderTurnos(Turnos);
        document.getElementById('totalTurnos').textContent = `${Turnos.length} turnos encontrados`;
    } catch (err) {
        console.error(err);
        document.getElementById('tablaTurnos').innerHTML = `
            <tr><td colspan="7" class="text-center text-danger">Error cargando los turnos</td></tr>`;
    }

    // 3. Conexión de eventos
    setupModalLogic();
    setupBusquedaDinamica();
    setupFormTurnoSubmit();
    
    // 💡 CONEXIÓN DE LOS FILTROS
    setupFiltros(); 
    
    // Llamar a la función de iniciales y otras tareas finales
    // setearIniciales();
}

// === Lógica principal de la página (DOMContentLoaded) ===

document.addEventListener('DOMContentLoaded', async () => {    // Verificar sesión
    const userRaw = sessionStorage.getItem('dogtorUser');
    if (!userRaw) {
        alert('No hay sesión iniciada. Volviendo al login.');
        window.location.href = '../Pages/login.html';
        return;
    }
    const user = JSON.parse(userRaw);
    const userId = user.id;

    // Cargar la lista de Disponibilidad (slots de agenda)
    await cargarDisponibilidad(); 
    
    // Inicializar catálogos y lógica del modal
    await cargarCatalogosModal();
    setupModalLogic();
    setupBusquedaDinamica();
    cargar();
    setupFormTurnoSubmit()
    // Cargar turnos principal 
  try {
        const res = await getAllAtenciones(); 
        
        if (!res.ok) throw new Error('Error al obtener turnos');
        const turnos = await res.json();
        console.log(turnos)
        Turnos = turnos; 
        renderTurnos(turnos);
         

        document.getElementById('totalTurnos').textContent = `${turnos.length} turnos encontrados`;
    } catch (err) {
        console.error(err);
        const tbody = document.getElementById('tablaTurnos');
        if (tbody) {
            tbody.innerHTML = `
                <tr><td colspan="7" class="text-center text-danger">Error cargando los turnos</td></tr>`;
        }
    }
    
    // 💡 INICIALIZAR FILTROS
    setupFiltros();
await initTurnosPage(userId);   
});
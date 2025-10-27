// turnos.js
import { 
    getAllAtenciones, getMascotaByClienteId ,getTiposAtencion, getAllMascotas, getTiposMascota, createAtencion, getDisponibilidad
} from './api.js';

// ===== Variables globales =====
let Turnos = []; 
let Mascotas = []; 
let TipoAtencion = []; 
let Disponibilidad = []; // 💡 Variable para slots de tiempo (se carga en cargarDisponibilidad)

// === Helpers DOM ===
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
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

// === Funciones de Carga de Catálogos ===

async function cargarDisponibilidad() {
    // 💡 Nueva función para cargar todos los slots de la agenda
    try {
        const res = await getDisponibilidad(); 
        if (!res.ok) throw new Error('Error al cargar la disponibilidad de la agenda');
        Disponibilidad = await res.json();
        console.log("Disponibilidad cargada:", Disponibilidad);
    } catch (err) {
        console.error("Error cargando disponibilidad:", err);
        Disponibilidad = [];
    }
}

async function cargarCatalogosModal() {
    // 1. Cargar Mascotas
    const resMascotas = await getAllMascotas(); 
    if (resMascotas.ok) {
        Mascotas = await resMascotas.json();
        poblarSelectMascotasPorCliente(Mascotas);
    } else { console.error("No se pudieron cargar las mascotas."); }

    // 2. Cargar Tipos de Atención
    const resTiposAtencion = await getTiposAtencion(); 
    if (resTiposAtencion.ok) {
        TipoAtencion = await resTiposAtencion.json();
        poblarSelectTiposAtencion(TipoAtencion);
    } else { console.error("No se pudieron cargar los tipos de atención."); }
    
    // 3. Cargar Tipos de Mascota
    const resTiposMascota = await getTiposMascota();
    if (resTiposMascota.ok) {
        const tiposMascota = await resTiposMascota.json();
        poblarSelectTiposMascota(tiposMascota);
    } else { console.error("No se pudieron cargar los tipos de mascota."); }
}

async function poblarSelectMascotasPorCliente(clienteId) {
    const selectMascota = $('#tMascota');
    const inputTutor = $('#tTutor');
    const statusDiv = $('#tTutorDniStatus');

    selectMascota.innerHTML = '<option value="">Seleccione mascota...</option>';
    selectMascota.disabled = true;
    inputTutor.value = '';
    statusDiv.textContent = 'Buscando mascotas...';

    if (!clienteId || isNaN(clienteId)) {
        statusDiv.textContent = 'Ingrese el DNI para buscar las mascotas.';
        return;
    }

    try {
        // Asumimos que el backend puede buscar por DNI o ID de Cliente y devolver las mascotas
        // En tu caso, el endpoint es por CodCliente, por lo que asumiremos que clienteId es el CodCliente.
        const res = await getMascotaByClienteId(clienteId); 

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
                opt.textContent = m.nombre; // Solo el nombre de la mascota
                opt.dataset.tutor = `${m.cliente.nombre} ${m.cliente.apellido}`;
                opt.dataset.clienteId = m.cliente.codCliente;
                selectMascota.appendChild(opt);
            });

            // Asignar el nombre del tutor y habilitar
            inputTutor.value = `${mascotasCliente[0].cliente.nombre} ${mascotasCliente[0].cliente.apellido}`;
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

function poblarSelectTiposAtencion(tipos) {
    const select = $('#tAtencion');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccione tipo de atención</option>';
    tipos.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.codTipoA;      // ✅ Usa codTipoA
        opt.textContent = t.atencion;  // ✅ Usa atencion
        select.appendChild(opt);
    });
}

function poblarSelectTiposMascota(tipos) {
    const select = $('#nMasTipo');
    if (!select) return;

    select.innerHTML = '';
    tipos.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.codTipoMascota;
        opt.textContent = t.nombre;
        select.appendChild(opt);
    });
}

// === Lógica del Modal (EXISTENTE vs NUEVO) ===

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
        $('#formTurno')?.reset(); 
    };

    modoRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            toggleBlocks(e.target.value === 'nuevo');
        });
    });

    toggleBlocks($('#modoNuevo').checked); 
    
    // Conectar el formulario a la función de envío
    const form = $('#formTurno');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// === Manejo del Formulario de Turnos (INSERCIÓN) ===
async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const alertBox = $('#tAlert');
    alertBox.classList.add('d-none');
    
    // --- 1. Obtener IDs y Modo ---
    const userRaw = sessionStorage.getItem('dogtorUser');
    const user = JSON.parse(userRaw);
    const codVeterinario = user.id; 
    const modoExistente = form.querySelector('input[name="modoAlta"][value="existente"]').checked;
    
    let codMascota;
    let codDisponibilidad;
    
    // ⚠️ Lógica Cliente/Mascota Existente
    if (modoExistente) {
        const selectedMascotaOption = $('#tMascota').options[$('#tMascota').selectedIndex];
        if (!selectedMascotaOption || !selectedMascotaOption.value) {
            alertBox.textContent = "Debe seleccionar una mascota existente.";
            alertBox.classList.remove('d-none');
            return;
        }
        codMascota = parseInt(selectedMascotaOption.value);
    } else {
        alertBox.textContent = "El registro de nuevo cliente/mascota aún no está implementado.";
        alertBox.classList.remove('d-none');
        return;
    }
    
    // --- 2. Obtener datos de Fecha/Hora y Slot de Disponibilidad ---
    const fechaSeleccionada = form.elements['tFecha'].value;
    const horaSeleccionada = form.elements['tHora'].value;
    
    // Buscar el slot LIBRE y coincidente
    const slotSeleccionado = Disponibilidad.find(d => 
        d.fecha.startsWith(fechaSeleccionada) && 
        d.hora.startsWith(horaSeleccionada) && 
        d.estado?.nombre?.toLowerCase() === 'libre' // Verifica que el slot esté libre
    );

    if (!slotSeleccionado) {
        alertBox.textContent = "El slot de fecha/hora seleccionado no está disponible.";
        alertBox.classList.remove('d-none');
        return;
    }
    codDisponibilidad = slotSeleccionado.codDisponibilidad;
    
    // --- 3. Construir Objeto Atencion ---
    const turnoData = {
        codTipoA: parseInt(form.elements['tAtencion'].value),
        importe: 0, // ⚠️ Placeholder: DEBE CALCULARSE
        codMascota: codMascota,
        codVeterinario: codVeterinario 
    };

    // --- 4. Llamada a la API ---
    try {
        // Asumo que insertAtencion toma el objeto DtoAtencion y el codDisponibilidad
        const res = await insertAtencion(turnoData, codDisponibilidad); 

        if (res.ok) {
            alert('Turno registrado con éxito!');
            // Cerrar modal y recargar turnos
            const modalElement = $('#modalTurno');
            const modalBootstrap = bootstrap.Modal.getInstance(modalElement);
            modalBootstrap.hide();
            window.location.reload(); 
        } else {
            const err = await res.json();
            throw new Error(err.message || 'Fallo al registrar el turno en el servidor.');
        }

    } catch (error) {
        console.error('Error al registrar:', error);
        alertBox.textContent = error.message;
        alertBox.classList.remove('d-none');
    }
}


function setupBusquedaDinamica() {
    const inputDni = $('#tTutorDni');
    const btnBuscar = $('#btnBuscarCliente'); // El botón que agregamos
    const inputFecha = document.getElementById('tFecha');
    
    if (inputFecha) {
        // Conexión principal: Al cambiar la fecha, cargar las horas libres
        inputFecha.addEventListener('change', cargarHorasDisponiblesPorFecha);
    }
    if (!inputDni || !btnBuscar) return;
    
    // Usamos el evento click del botón para iniciar la búsqueda
    btnBuscar.addEventListener('click', () => {
        const dniValue = inputDni.value.trim();
        // ⚠️ IMPORTANTE: Necesitas una función que convierta DNI a CodCliente
        // Si no tienes esa función, usa el DNI como si fuera el CodCliente
        // (Asumiendo que el CodCliente es el mismo ID que estás buscando)
        
        // Dado que el endpoint es por CodCliente, haremos la búsqueda con el valor del input:
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
        // Opcional: Ordenar por hora (aunque la API debería traerlos ordenados)
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
            
            // 💡 IMPORTANTE: Guardamos el CodDisponibilidad como el valor de la opción
            opt.value = d.codDisponibilidad; 
            opt.textContent = horaString;
            selectHora.appendChild(opt);
        });
        selectHora.disabled = false;
        alertBox.classList.add('d-none'); // Ocultar alerta si hay slots
    }
}


// === Lógica principal de la página (DOMContentLoaded) ===

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar sesión
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
});
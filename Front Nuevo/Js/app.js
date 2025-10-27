import { 
    // Asegúrate de que getMascotaByClienteId esté bien importado y funcione con el codCliente.
    getMascotaByClienteId, getTiposMascota, getAllAtenciones, getTiposAtencion, 
    getDisponibilidad, getTurnosDisponibles,
    getAllMascotas,createAtencion
} from './api.js';

// ===== Variables globales =====
let Mascota = []; 
let Tipo_Atencion = [];
let Disponibilidad = [];
let Turno = [];
let TipoMascota = []; 
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

// ===== Helpers de datos =====
function nombreCliente(id) {
    // Busca el cliente/dueño en la lista de turnos (más simple si el objeto Turno ya está cargado)
    const t = Turno.find(x => x.id_cliente === id); 
    if (!t || !t.nombreCliente) return '—';
    return t.nombreCliente;
}

function nombreMascota(id) {
    const t = Turno.find(x => x.id_mascota === id);
    return t ? t.nombreMascota : '—';
}

function nombreAtencion(id) {
    const t = Tipo_Atencion.find(x => x.codTipoA === id); 
    // Asumo que en el backend tienes 'atencion' y no 'descripcion' en el DTO para el tipo de atención
    return t ? t.atencion : '—'; 
}

function precioAtencion(id) {
    const t = Tipo_Atencion.find(x => x.codTipoA === id);
    return t ? t.precio : 0; 
}

function formatFecha(fecha) {
    const f = new Date(fecha);
    return f.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

// ===== Lógica del Modal de Turnos (DNI y Mascota) =====

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
        // Conexión principal: Al cambiar la fecha, cargar las horas libres
        inputFecha.addEventListener('change', cargarHorasDisponiblesPorFecha);
    }
    if (!inputDni || !btnBuscar) return;
    
    btnBuscar.addEventListener('click', () => {
        const dniValue = inputDni.value.trim();
        // ⚠️ Usamos el DNI como si fuera el CodCliente según nuestra simplificación
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
        opt.value = t.codTipoA;      // ✅ Propiedad correcta del JSON del backend
        opt.textContent = t.atencion;  // ✅ Propiedad correcta del JSON del backend
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
        inputFecha.disabled = true; // 💡 ¡DESHABILITADO AQUÍ!
    }
    
    // 2. Limpiar y pre-cargar el select de Hora (también deshabilitado)
    if (selectHora) {
        selectHora.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = hora;
        opt.textContent = hora;
        selectHora.appendChild(opt);
        selectHora.disabled = true; // El select de hora también debe estar deshabilitado
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
    const total = Turno.reduce((acumulador, atencion) => {
        return acumulador + (atencion.importe || 0); 
    }, 0)
    $('#kpiFacturacion').textContent = '$ ' + new Intl.NumberFormat('es-AR').format(total);
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

// ===== Próximos turnos (ACTUALIZADO) =====
function renderProximos() {
    const cont = $('#listaProximos');
    if (!cont) return;
    
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
        const estadoNombre = t.estado || 'Desconocido';
        const li = document.createElement('a');
        
        li.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <div>
                <div class="fw-semibold">${t.nombreMascota} — ${t.nombreAtencion}</div>
                <small class="text-secondary">${t.fecha} ${t.hora} • ${t.nombreCliente}</small>
            </div>
            <span class="badge rounded-pill ${badgeEstado(estadoNombre)}">${estadoNombre}</span>
        `;
        cont.appendChild(li);
    });
}

// ===== Tabla Disponibilidad (MODIFICADO) =====
function renderDisponibilidad() {
    const tbody = $('#tablaDisponibilidad');
    // Si el elemento no existe (ej: estamos en otra página), salimos.
    if (!tbody) return console.error("No se encontró el tbody con id 'tablaDisponibilidad'");
    
    tbody.innerHTML = ''; // Limpiamos el cuerpo de la tabla

    // 1. Filtrar por slots de HOY y ordenar por HORA
    Disponibilidad
        .filter(d => d.fecha?.split('T')[0] === yyyy_mm_dd)
        .sort((a, b) => a.hora.localeCompare(b.hora))
        .forEach(d => {
            // El estado viene del DTO
            const estadoNombre = d.estado?.nombre || 'Libre';
            const esLibre = estadoNombre.toLowerCase() === 'libre'; // Bandera para habilitar el botón
            
            const tr = document.createElement('tr');
            
            const fechaSlot = d.fecha?.split('T')[0];
            const horaSlot = d.hora.substring(0, 5);
            
            // 💡 Generamos el HTML de la fila
            tr.innerHTML = `
                <td>${formatFecha(d.fecha)}</td>
                <td>${horaSlot}</td>
                <td><span class="badge rounded-pill ${badgeEstado(estadoNombre)}">${estadoNombre}</span></td>
                
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-info" 
                            ${!esLibre ? 'disabled' : ''} 
                            data-disponibilidad-id="${d.codDisponibilidad}">
                        Tomar turno
                    </button>
                </td>
            `;

            // 2. Agregamos la fila al DOM primero
            tbody.appendChild(tr);

            // 3. Agregamos el event listener al botón recién insertado
            const btnTomarTurno = tr.querySelector('button');
            if (btnTomarTurno && esLibre) {
                btnTomarTurno.addEventListener('click', () => {
                    // Llamamos a la función que abre el modal y precarga los datos
                    abrirModalTurno(
                        d.codDisponibilidad, 
                        fechaSlot, 
                        horaSlot
                    );
                });
            }
        });
}
// ===== Funciones de Carga de Datos (No modificadas) =====

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
        
        // 💡 1. Manejar el 404 (Not Found) como un resultado VÁLIDO (sin data)
        if (res.status === 404) {
            Disponibilidad = [];
            console.warn("No se encontraron slots de disponibilidad en el servidor (código 404).");
            return; // Salir sin lanzar error ni alerta crítica
        }

        // 2. Manejar cualquier otro error HTTP (500, 401, etc.)
        if (!res.ok) {
            // Si no es OK y no es 404, es un error real del servidor.
            throw new Error(`Error ${res.status}: Fallo al cargar la agenda.`);
        }
        
        // 3. Éxito (Código 200)
        Disponibilidad = await res.json();
        console.log("Disponibilidad cargada:", Disponibilidad);

    } catch (err) {
        console.error("Error cargando disponibilidad:", err);
        
        // 🚨 Mostrar alerta crítica solo para errores graves de conexión/servidor
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
    // Lo mantengo por si se usa en KPIs futuros.
    try {
        const res = await getTurnosDisponibles();
        if (!res.ok) throw new Error(`Error ${res.status}`);
        
        const turnosDisponibles = await res.json(); 
        console.log("Turnos disponibles (para KPI):", turnosDisponibles.length);
    } catch (err) {
        console.error("Error cargando turnos disponibles (solo log):", err);
    }
}

async function cargarTurnosProximos() {
    try {
        // 💡 NOTA: Reemplazar con getTurnosByVeterinarioId(user.id) en un caso real
        const res = await getAllAtenciones(); 
        if (!res.ok) throw new Error(`Error al cargar turnos (status ${res.status})`);

        const data = await res.json();
        Turno = data.map(t => ({
            id: t.codAtencion,
            fecha: t.disponibilidad?.fecha?.split('T')[0] || '',
            hora: t.disponibilidad?.hora?.substring(0, 5) || '',
            
            // 💡 Asumo que el nombre del estado viene de una de estas dos rutas
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
    e.preventDefault(); // Evita el envío tradicional del formulario

    const form = e.target;
    const btnGuardar = form.querySelector('button[type="submit"]');
    const alertBox = $('#tAlert');

    // 1. Obtener ID del Veterinario (Usuario actual)
    const rawUser = sessionStorage.getItem('dogtorUser');
    const user = rawUser ? JSON.parse(rawUser) : null;
    const codVeterinario = user?.id;

    alertBox.classList.add('d-none'); // Ocultar alerta inicial

    if (!codVeterinario) {
        alertBox.textContent = 'Error: No se pudo identificar al veterinario (cierre y vuelva a iniciar sesión).';
        alertBox.classList.remove('d-none');
        return;
    }

    // 2. Obtener datos del formulario
    // 💡 Aquí extraemos el CodDisponibilidad del campo oculto o select.
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
        // ❌ Eliminamos codDisponibilidad de aquí, ya que el backend lo espera en la URL, no en el body.
        // codDisponibilidad: parseInt(codDisponibilidad), 
    };
    
    // Deshabilitar botón y mostrar carga
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';
    alertBox.classList.remove('alert-danger');
    console.log(insertTurnoData);

    // 4. Llamada a la API
    try {
        // 🚀 CORRECCIÓN CLAVE: Pasar el codDisponibilidad como SEGUNDO argumento para la URL
        const res = await createAtencion(insertTurnoData, codDisponibilidad); 
        
       if (res.ok) {
            
            // 🚀 NUEVA LÓGICA: SWEETALERT2 CON ESTILO OSCURO
            Swal.fire({
                title: '¡Turno Insertado!',
                html: 'El slot ha sido reservado con éxito en la agenda.',
                icon: 'success', // Muestra el check de éxito
                background: '#1a202c', // Fondo oscuro (adaptar a tu CSS)
                color: '#BFD4EA', // Color del texto claro
                timer: 3500, // Duración de 3.5 segundos (3500ms)
                timerProgressBar: true,
                showConfirmButton: false,
                customClass: {
                    title: 'swal2-title-custom' // Si quieres usar la fuente Orbitron, definir la clase en app.css
                }
            }).then(() => {
                // 5. Ocultar modal (si sigue abierto) y recargar la dashboard
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
    const btn = $('#btnPerfil');
    const menu = $('#menuPerfil');
    const logout = $('#btnCerrarSesion'); // Usé btnCerrarSesion en el HTML

    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });
    
    document.addEventListener('click', e => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) menu.classList.remove('show');
    });

    if (logout) logout.addEventListener('click', () => {
        sessionStorage.removeItem('dogtorUser');
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        window.location.href = '../Html/index.html';
    });
}


// ===== Inicialización General =====

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
    if (!raw) { window.location.href = '../Html/index.html'; return; }
    const user = JSON.parse(raw);
    
    cargarDatos(user.id).then(() => {
        setearIniciales();
        renderKPIs();
        renderChart();
        renderProximos();
        renderDisponibilidad();
        setupPerfilMenu();
        setupFormTurnoSubmit()
        setupBusquedaDinamica(); // 💡 Inicializar la lógica de búsqueda por DNI
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

// ===== Arranque =====
document.addEventListener('DOMContentLoaded', initDashboard);
// clientes.js
import { getAllMascotas, getTiposMascota,createMascota } from './api.js';

// ===== Variables globales =====
let Mascotas = [];          // Lista filtrada
let MascotasCargadas = [];  // Data original
let TipoMascota = [];       // Catálogo de tipos

// ===== Variables filtros =====
let tipoActivo = '';
let nombreBusqueda = '';
let clienteBusqueda = '';

// ===== Helpers DOM =====
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ===== Imagen default según tipo =====
function imagenPorTipo(tipoNombre) {
    switch ((tipoNombre || '').toLowerCase()) {
        case 'gato': return '../Assets/gato.png';
        case 'perro': return '../Assets/perro.png';
        case 'roedor': return '../Assets/roedor.png';
        case 'ave': return '../Assets/ave.png';
        default: return '../Assets/mascota.png';
    }
}

// ===== Filtrado combinado =====
function filtrarMascotasCombinado() {
    let mascotasFiltradas = MascotasCargadas;

    if (nombreBusqueda) {
        const query = nombreBusqueda.toLowerCase();
        mascotasFiltradas = mascotasFiltradas.filter(m => m.nombre.toLowerCase().includes(query));
    }

    if (tipoActivo) {
        mascotasFiltradas = mascotasFiltradas.filter(m => String(m.tipo?.codTipoMascota) === tipoActivo);
    }

    if (clienteBusqueda) {
        const query = clienteBusqueda.toLowerCase();
        mascotasFiltradas = mascotasFiltradas.filter(m => {
            const cliente = m.cliente;
            if (!cliente) return false;
            const dniStr = String(cliente.dni);
            const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
            return dniStr.includes(query) || nombreCompleto.includes(query);
        });
    }

    Mascotas = mascotasFiltradas;
    renderMascotas();
}

// ===== Inicializar búsqueda =====
function initBusqueda() {
    const inputMascota = $('#q');
    const clearMascotaBtn = $('#clearQ');
    if (inputMascota) {
        inputMascota.addEventListener('input', () => {
            nombreBusqueda = inputMascota.value.toLowerCase().trim();
            filtrarMascotasCombinado();
        });
        if (clearMascotaBtn) {
            clearMascotaBtn.addEventListener('click', () => {
                inputMascota.value = '';
                nombreBusqueda = '';
                filtrarMascotasCombinado();
            });
        }
    }

    const inputCliente = $('#qCliente');
    const clearClienteBtn = $('#clearQCliente');
    if (inputCliente) {
        inputCliente.addEventListener('input', () => {
            clienteBusqueda = inputCliente.value.toLowerCase().trim();
            filtrarMascotasCombinado();
        });
        if (clearClienteBtn) {
            clearClienteBtn.addEventListener('click', () => {
                inputCliente.value = '';
                clienteBusqueda = '';
                filtrarMascotasCombinado();
            });
        }
    }
}

// ===== Render filtros por tipo =====
function renderFiltroTipoMascota() {
    const cont = $('#filtroTipoMascota');
    if (!cont) return;
    cont.innerHTML = '';

    const btnTodos = document.createElement('button');
    btnTodos.className = 'btn btn-outline-info';
    btnTodos.textContent = 'Todos';
    btnTodos.dataset.tipo = '';
    cont.appendChild(btnTodos);

    TipoMascota.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-info';
        btn.textContent = t.nombre;
        btn.dataset.tipo = String(t.codTipoMascota);
        cont.appendChild(btn);
    });

    const buttons = cont.querySelectorAll('button');
    if (buttons.length) buttons[0].classList.add('active');

    buttons.forEach(b => {
        b.addEventListener('click', () => {
            buttons.forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            tipoActivo = b.dataset.tipo;
            filtrarMascotasCombinado();
        });
    });
}

// ===== Render mascotas =====
function renderMascotas() {
    const grid = $('#gridMascotas');
    if (!grid) return;
    grid.innerHTML = '';

    Mascotas.forEach(m => {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 card-mascota';
        col.dataset.clienteId = m.cliente?.codCliente || '';
        col.dataset.tipo = m.tipo?.codTipoMascota || '';

        const imgSrc = imagenPorTipo(m.tipo?.nombre);

        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">
                <div class="ratio" style="--bs-aspect-ratio: 70%; background-color:#f8f9fa; display:flex; align-items:center; justify-content:center;">
                    <img src="${imgSrc}" class="card-img-top w-100 h-100" alt="${m.tipo?.nombre || 'Mascota'}" style="object-fit: contain; width: 100%; height: 100%; padding: 0.5rem;">
                </div>
                <div class="card-body">
                    <h5 class="card-title mb-1">${m.nombre}</h5>
                    <p class="card-text mb-1 text-secondary small">Tipo: ${m.tipo?.nombre || '—'}</p>
                    <p class="card-text mb-1 text-secondary small">Edad: ${m.edad || '—'}</p>
                    <p class="card-text small text-muted">Dueño: ${m.cliente?.nombre || '—'} ${m.cliente?.apellido || ''}</p>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });

    const count = $('#count');
    if (count) count.textContent = Mascotas.length;
}

// ===== Cargar tipos de mascota =====
async function cargarTiposMascota() {
    try {
        const res = await getTiposMascota();
        if (!res.ok) throw new Error('Error cargando tipos de mascota');
        TipoMascota = await res.json();
        renderFiltroTipoMascota();
    } catch (err) {
        console.error("Error cargando tipos de mascota:", err);
        TipoMascota = [];
    }
}

// ===== Cargar mascotas =====
async function cargarMascotas() {
    try {
        const res = await getAllMascotas();
        if (!res.ok) throw new Error('Error al cargar mascotas');
        const data = await res.json();
        MascotasCargadas = data;
        Mascotas = data;
        renderMascotas();
    } catch (err) {
        console.error("Error cargando mascotas:", err);
        Mascotas = [];
        MascotasCargadas = [];
    }
}

// ===== Modales =====
function abrirModalInicio() {
    const modal = new bootstrap.Modal($('#modalInicio'));
    modal.show();

    $('#btnNuevoDueño').onclick = () => {
        modal.hide();
        abrirModalRegistro('dueño');
    };

    $('#btnMascotaExistente').onclick = () => {
        modal.hide();
        abrirModalBuscarDueño();
    };
}

function abrirModalBuscarDueño() {
    const modal = new bootstrap.Modal($('#modalBuscarDueño'));
    modal.show();

    $('#formBuscarDni').onsubmit = async e => {
        e.preventDefault();
        const dni = $('#buscarDni').value.trim();
        if (!dni) return;

        // TODO: Validar DNI con API
        const existe = true; // simular que existe
        if (!existe) {
            Swal.fire('Error', 'No se encontró un dueño con ese DNI', 'error');
            return;
        }

        modal.hide();
        abrirModalRegistro('mascota', dni);
    };
}

function abrirModalRegistro(modo = 'dueño', dniTutor = '') {
    const modal = new bootstrap.Modal($('#modalRegistro'));

    const titulo = $('#modalRegistroLabel');
    const bloqueDueño = $('#bloqueDueño');
    const bloqueMascota = $('#bloqueMascota');

    const inputsDueño = bloqueDueño.querySelectorAll('input');
    const inputsMascota = bloqueMascota.querySelectorAll('input, select');

    if (modo === 'dueño') {
        titulo.textContent = 'Registrar Nuevo Dueño';
        bloqueDueño.classList.remove('d-none');
        bloqueMascota.classList.add('d-none');
        $('#formRegistro').reset();

        // required dinámico
        inputsDueño.forEach(i => i.required = true);
        inputsMascota.forEach(i => i.required = false);

    } else if (modo === 'mascota') {
        titulo.textContent = 'Registrar Nueva Mascota';
        bloqueDueño.classList.add('d-none');
        bloqueMascota.classList.remove('d-none');
        $('#rTutorDni').value = dniTutor;
        $('#rMascotaNombre').value = '';
        $('#rMascotaEdad').value = '';
        const selectTipo = $('#rMascotaTipo');
        if (selectTipo && TipoMascota.length) {
            selectTipo.innerHTML = TipoMascota.map(t =>
                `<option value="${t.codTipoMascota}">${t.nombre}</option>`
            ).join('');
        }

        // required dinámico
        inputsDueño.forEach(i => i.required = false);
        inputsMascota.forEach(i => i.required = true);
    }

    modal.show();
}

const modalRegistroEl = $('#modalRegistro');
modalRegistroEl.addEventListener('hidden.bs.modal', () => {
    $('#formRegistro').reset();
});

// ===== Formulario registro =====
$('#formRegistro').onsubmit = async e => {
    e.preventDefault();

    if (!$('#bloqueDueño').classList.contains('d-none')) {
        // Registrar dueño
        const nombre = $('#rNombre').value.trim();
        const apellido = $('#rApellido').value.trim();
        const dni = $('#rDni').value.trim();
        const telefono = $('#rTelefono').value.trim();

        // TODO: Llamar API crearDueño({nombre, apellido, dni, telefono})
        const result = true; // simular éxito
        if (result) {
            const { isConfirmed } = await Swal.fire({
                title: 'Dueño cargado con éxito',
                text: '¿Desea añadirle una mascota?',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'No'
            });

            if (isConfirmed) {
                abrirModalRegistro('mascota', dni);
            } else {
                $('#modalRegistro').modal('hide');
            }
        }
    } else {
    // Registrar mascota
    const dniTutor = $('#rTutorDni').value;
    const nombre = $('#rMascotaNombre').value.trim();
    const edad = $('#rMascotaEdad').value.trim();
    const tipo = $('#rMascotaTipo').value;

    if (!nombre || !tipo || !dniTutor) {
        Swal.fire('Error', 'Complete todos los campos obligatorios', 'error');
        return;
    }

    try {
        const nuevaMascota = {
            Nombre: nombre,
            Edad: Number(edad),
            CodCliente: 1002 , // id real del dueño
            CodTipo: 2,
            Eliminado: false
        };        
        const res = await createMascota(nuevaMascota);

        if (res.ok) {
            const data = await res.json();
            Swal.fire('Éxito', 'Mascota registrada correctamente', 'success');
            $('#modalRegistro').modal('hide');

            // Opcional: recargar lista de mascotas
            cargarMascotas();
        } else {
            const errData = await res.json();
            Swal.fire('Error', errData.message || 'No se pudo registrar la mascota', 'error');
        }
    } catch (error) {
        console.error('Error al registrar mascota:', error);
        Swal.fire('Error', 'Ocurrió un error al registrar la mascota', 'error');
    }
}
};

// ===== Inicialización =====
async function initClientes() {
    const raw = sessionStorage.getItem('dogtorUser');
    if (!raw) {
        window.location.href = './index.html';
        return;
    }

    await Promise.all([cargarTiposMascota(), cargarMascotas()]);
    initBusqueda();

    const btnRegistrarCliente = $('#btnRegistrarCliente');
    if (btnRegistrarCliente) {
        btnRegistrarCliente.addEventListener('click', abrirModalInicio);
    }
}

document.addEventListener('DOMContentLoaded', initClientes);

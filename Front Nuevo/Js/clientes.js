// clientes.js
import { getAllMascotas, getTiposMascota, createMascota, getClientesByDNI, createCliente } from './api.js';

// ===== Variables globales =====
let Mascotas = [];          // Lista filtrada
let MascotasCargadas = [];  // Data original
let TipoMascota = [];       // Catálogo de tipos
let paginaActual = 1;
const MASCOTAS_POR_PAGINA = 6;

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

    const totalMascotas = Mascotas.length;
    const totalPaginas = Math.ceil(totalMascotas / MASCOTAS_POR_PAGINA);
    if (paginaActual > totalPaginas) paginaActual = 1;

    const inicio = (paginaActual - 1) * MASCOTAS_POR_PAGINA;
    const fin = inicio + MASCOTAS_POR_PAGINA;
    const mascotasPagina = Mascotas.slice(inicio, fin);

    mascotasPagina.forEach(m => {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 card-mascota';
        col.dataset.clienteId = m.cliente?.codCliente || '';
        col.dataset.tipo = m.tipo?.codTipoMascota || '';

        const imgSrc = m.imagenMascota || imagenPorTipo(m.tipo?.nombre);

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
    if (count) count.textContent = totalMascotas;

    renderPaginacion(totalPaginas);
}

function renderPaginacion(totalPaginas) {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const oldPagination = document.querySelector('#paginationMascotas');
    if (oldPagination) oldPagination.remove();

    if (totalPaginas <= 1) return;

    const nav = document.createElement('nav');
    nav.id = 'paginationMascotas';
    nav.className = 'mt-3 d-flex justify-content-center';

    const ul = document.createElement('ul');
    ul.className = 'pagination pagination-sm justify-content-center mb-0';

    const liPrev = document.createElement('li');
    liPrev.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
    liPrev.innerHTML = `<button class="page-link bg-dark text-info border-info">«</button>`;
    liPrev.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderMascotas();
        }
    });
    ul.appendChild(liPrev);

    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${paginaActual === i ? 'active' : ''}`;
        li.innerHTML = `<button class="page-link bg-dark text-info border-info">${i}</button>`;
        li.addEventListener('click', () => {
            paginaActual = i;
            renderMascotas();
        });
        ul.appendChild(li);
    }

    const liNext = document.createElement('li');
    liNext.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
    liNext.innerHTML = `<button class="page-link bg-dark text-info border-info">»</button>`;
    liNext.addEventListener('click', () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderMascotas();
        }
    });
    ul.appendChild(liNext);

    nav.appendChild(ul);
    footer.insertAdjacentElement('beforebegin', nav);
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

    const formBuscar = $('#formBuscarDni');
    const inputDni = $('#buscarDni');

    if (!formBuscar || !inputDni) return;

    formBuscar.onsubmit = async e => {
        e.preventDefault();
        const dni = inputDni.value.trim();
        if (!dni) return;

        try {
            const res = await getClientesByDNI(dni);
            if (!res.ok) throw new Error('No se encontró un dueño con ese DNI');
            const dataCliente = await res.json();
            if (!dataCliente.length) throw new Error('No se encontró un dueño con ese DNI');

            const cliente = dataCliente[0];
            modal.hide();
            abrirModalRegistro('mascota', cliente.dni, `${cliente.nombre} ${cliente.apellido}`);
        } catch (err) {
            console.error(err);
            Swal.fire('Error', err.message || 'Ocurrió un error al buscar el dueño', 'error');
        }
    };
}

function abrirModalRegistro(modo = 'dueño', dniTutor = '', nombreTutor = '') {
    const modalEl = $('#modalRegistro');
    if (!modalEl) return;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    const titulo = $('#modalRegistroLabel');
    const bloqueDueño = $('#bloqueDueño');
    const bloqueMascota = $('#bloqueMascota');
    const formRegistro = $('#formRegistro');

    if (!titulo || !bloqueDueño || !bloqueMascota || !formRegistro) return;

    $('#rTutorDni').value = dniTutor;
    $('#rTutorNombre').value = nombreTutor || '';

    const inputsDueño = bloqueDueño.querySelectorAll('input');
    const inputsMascota = bloqueMascota.querySelectorAll('input, select');

    if (modo === 'dueño') {
        titulo.textContent = 'Registrar Nuevo Dueño';
        bloqueDueño.classList.remove('d-none');
        bloqueMascota.classList.add('d-none');
        formRegistro.reset();

        inputsDueño.forEach(i => i.required = true);
        inputsMascota.forEach(i => i.required = false);
    } else if (modo === 'mascota') {
        titulo.textContent = nombreTutor
            ? `Registrar nueva mascota para ${nombreTutor}`
            : 'Registrar Nueva Mascota';

        bloqueDueño.classList.add('d-none');
        bloqueMascota.classList.remove('d-none');

        $('#rMascotaNombre').value = '';
        $('#rMascotaEdad').value = '';

       const inputImagen = document.getElementById('rMascotaImagen');
const preview = document.getElementById('previewMascota');

inputImagen.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            preview.src = reader.result;
            preview.classList.add('visible'); // muestra la preview
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = '';
        preview.classList.remove('visible'); // oculta si no hay imagen
    }
});
        if (preview) preview.src = '';
        if (inputImagen) inputImagen.value = '';

        const selectTipo = $('#rMascotaTipo');
        if (selectTipo && TipoMascota.length) {
            selectTipo.innerHTML = TipoMascota.map(t =>
                `<option value="${t.codTipoMascota}">${t.nombre}</option>`
            ).join('');
        }

        inputsDueño.forEach(i => i.required = false);
        inputsMascota.forEach(i => i.required = true);
    }

    // 🔹 Preview de imagen
    const inputImagen = $('#rMascotaImagen');
    const preview = $('#previewMascota');
    if (inputImagen) {
        inputImagen.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) {
                if (preview) preview.src = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                if (preview) preview.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // 🔹 Reset al cerrar modal
    modalEl.addEventListener('hidden.bs.modal', () => {
        formRegistro.reset();
        if (preview) preview.src = '';
        if (inputImagen) inputImagen.value = '';
    });
}

// ===== Formulario registro =====
$('#formRegistro').onsubmit = async e => {
    e.preventDefault();
    const bloqueDueño = $('#bloqueDueño');
    const bloqueMascota = $('#bloqueMascota');

    if (!bloqueDueño.classList.contains('d-none')) {
        // Registrar dueño
        const nombre = $('#rNombre').value.trim();
        const apellido = $('#rApellido').value.trim();
        const dni = $('#rDni').value.trim();
        const telefono = $('#rTelefono').value.trim();

        if (!nombre || !apellido || !dni) {
            Swal.fire('Error', 'Complete todos los campos obligatorios', 'error');
            return;
        }

        try {
            const res = await createCliente({ Nombre: nombre, Apellido: apellido, Dni: Number(dni), Telefono: telefono });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || 'No se pudo registrar el dueño');
            }

            Swal.fire({
                title: 'Dueño cargado con éxito',
                text: '¿Desea añadirle una mascota?',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'No'
            }).then(({ isConfirmed }) => {
                const modalRegistro = bootstrap.Modal.getInstance($('#modalRegistro'));
                if (modalRegistro) modalRegistro.hide();

                if (isConfirmed) {
                    const nombreCompleto = `${nombre} ${apellido}`;
                    setTimeout(() => abrirModalRegistro('mascota', dni, nombreCompleto), 300);
                }
            });

        } catch (err) {
            console.error(err);
            Swal.fire('Error', err.message || 'Error inesperado', 'error');
        }
    } else if (!bloqueMascota.classList.contains('d-none')) {
        // Registrar mascota
        const dniTutor = $('#rTutorDni').value.trim();
        const nombre = $('#rMascotaNombre').value.trim();
        const edad = $('#rMascotaEdad').value.trim();
        const tipo = $('#rMascotaTipo').value;
        const inputImagen = $('#rMascotaImagen');

        if (!dniTutor || !nombre || !tipo) {
            Swal.fire('Error', 'Complete todos los campos obligatorios', 'error');
            return;
        }

        try {
            const resCliente = await getClientesByDNI(dniTutor);
            if (!resCliente.ok) throw new Error('No se encontró un dueño con ese DNI');
            const dataCliente = await resCliente.json();
            if (!dataCliente.length) throw new Error('No se encontró un dueño con ese DNI');

            const codCliente = dataCliente[0].codCliente;

            const nuevaMascota = {
                Nombre: nombre,
                Edad: Number(edad),
                CodCliente: codCliente,
                CodTipo: Number(tipo),
                Activo: true
            };

            const archivoImagen = inputImagen?.files?.[0] || null;
            const res = await createMascota(nuevaMascota, archivoImagen);

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'No se pudo registrar la mascota');
            }

            Swal.fire('Éxito', 'Mascota registrada correctamente', 'success');
            const modal = bootstrap.Modal.getInstance($('#modalRegistro'));
            if (modal) modal.hide();
            cargarMascotas();
        } catch (err) {
            console.error(err);
            Swal.fire('Error', err.message || 'Ocurrió un error al registrar la mascota', 'error');
        }
    }
};

// ===== Iniciales usuario =====
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
        } catch {}
    }
    badge.textContent = initials.toUpperCase();
}

// Inicialización 
async function initClientes() {
    setearIniciales();
    const raw = sessionStorage
    .getItem('dogtorUser');
if (!raw) {
window.location.href = './index.html';
return;
}
await Promise.all([cargarTiposMascota(), cargarMascotas()]);
initBusqueda();

const btnRegistrarCliente = $('#btnRegistrarCliente');
if (btnRegistrarCliente) btnRegistrarCliente.addEventListener('click', abrirModalInicio);

const btnCerrarSesion = $('#btnCerrarSesion');
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', e => {
        e.preventDefault();
        sessionStorage.removeItem('dogtorUser');
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        window.location.href = '../Pages/index.html';
    });
}
}

document.addEventListener('DOMContentLoaded', initClientes);
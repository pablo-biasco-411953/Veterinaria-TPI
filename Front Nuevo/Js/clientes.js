// clientes.js
import { getMascotaByClienteId, getTiposMascota } from './api.js';

// ===== Variables globales =====
let Mascotas = [];
let TipoMascota = [];

// ===== Variables para filtros =====
let tipoActivo = '';
let nombreBusqueda = '';

// ===== Helpers DOM =====
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ===== Imagen default según tipo =====
function imagenPorTipo(tipoNombre) {
    switch ((tipoNombre || '').toLowerCase()) {
        case 'gato':
            return '../Assets/gato.png';
        case 'perro':
            return '../Assets/perro.png';
        case 'roedor':
            return '../Assets/roedor.png';
        case 'ave':
            return '../Assets/ave.png';
        default:
            return '../Assets/mascota.png'; // genérico
    }
}

// ===== Filtrado combinado =====
function filtrarMascotasCombinado() {
    const tarjetas = document.querySelectorAll('.card-mascota');
    tarjetas.forEach(t => {
        const nombre = t.querySelector('.card-title')?.textContent.toLowerCase() || '';
        const tipo = t.dataset.tipo || '';

        const cumpleTipo = !tipoActivo || tipo === tipoActivo;
        const cumpleNombre = !nombreBusqueda || nombre.includes(nombreBusqueda);

        t.style.display = cumpleTipo && cumpleNombre ? '' : 'none';
    });
}

// ===== Inicializar búsqueda =====
function initBusqueda() {
    const input = $('#q');
    const clearBtn = $('#clearQ');
    if (!input) return;

    input.addEventListener('input', () => {
        nombreBusqueda = input.value.toLowerCase();
        filtrarMascotasCombinado();
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            nombreBusqueda = '';
            filtrarMascotasCombinado();
        });
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
        btn.dataset.tipo = t.codTipoMascota;
        cont.appendChild(btn);
    });

    const buttons = cont.querySelectorAll('button');
    if (buttons.length) buttons[0].classList.add('active');

    buttons.forEach(b => {
        b.addEventListener('click', () => {
            buttons.forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            tipoActivo = b.dataset.tipo; // guardamos tipo seleccionado
            filtrarMascotasCombinado();  // filtramos combinando nombre y tipo
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
        col.dataset.tipo = m.tipo?.codTipoMascota || '';

        const imgSrc = imagenPorTipo(m.tipo?.nombre);

        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">
                <div class="ratio" style="--bs-aspect-ratio: 70%; background-color:#f8f9fa; display:flex; align-items:center; justify-content:center;">
                    <img src="${imgSrc}" 
                         class="card-img-top w-100 h-100" 
                         alt="${m.tipo?.nombre || 'Mascota'}" 
                         style="object-fit: contain; width: 100%; height: 100%; padding: 0.5rem;">
                </div>
                <div class="card-body">
                    <h5 class="card-title mb-1">${m.nombre}</h5>
                    <p class="card-text mb-1 text-secondary small">Tipo: ${m.tipo?.nombre || '—'}</p>
                    <p class="card-text mb-1 text-secondary small">Edad: ${m.edad || '—'}</p>
                    <p class="card-text small text-muted">
                        Dueño: ${m.cliente?.nombre || '—'} ${m.cliente?.apellido || ''}
                    </p>
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
        console.error(err);
        TipoMascota = [];
    }
}

// ===== Cargar mascotas del cliente =====
async function cargarMascotas(userId) {
    try {
        const res = await getMascotaByClienteId(userId);
        if (!res.ok) throw new Error('Error al cargar mascotas');
        Mascotas = await res.json();
        renderMascotas();
    } catch (err) {
        console.error(err);
        Mascotas = [];
    }
}

// ===== Inicialización =====
async function initClientes() {
    const raw = sessionStorage.getItem('dogtorUser');
    if (!raw) { 
        window.location.href = './index.html'; 
        return; 
    }
    const user = JSON.parse(raw);

    await Promise.all([
        cargarTiposMascota(),
        cargarMascotas(user.id)
    ]);

    initBusqueda();
}

document.addEventListener('DOMContentLoaded', initClientes);

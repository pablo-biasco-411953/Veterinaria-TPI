// clientes.js
import { getAllMascotas, getTiposMascota } from './api.js'; 
// Asumo que getMascotaByClienteId no es necesario ya que usamos getAllMascotas + filtro JS

// ===== Variables globales =====
let Mascotas = [];          // Lista de mascotas actualmente renderizadas (la lista filtrada)
let MascotasCargadas = [];  // COPIA DE LA DATA ORIGINAL (para filtrar)
let TipoMascota = [];       // Catálogo de tipos

// ===== Variables para filtros =====
let tipoActivo = '';
let nombreBusqueda = '';
let clienteBusqueda = ''; // Búsqueda por Cliente/Dueño (DNI o Nombre/Apellido)

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

// ===== Filtrado combinado (COMPLETO) =====
function filtrarMascotasCombinado() {
    // 1. Usamos la copia original como base
    let mascotasFiltradas = MascotasCargadas; 

    // 2. Filtrar por Nombre de Mascota
    if (nombreBusqueda) {
        const query = nombreBusqueda.toLowerCase();
        mascotasFiltradas = mascotasFiltradas.filter(m => 
            m.nombre.toLowerCase().includes(query)
        );
    }
    
    // 3. Filtrar por Tipo de Mascota
    if (tipoActivo) {
        mascotasFiltradas = mascotasFiltradas.filter(m => 
            String(m.tipo?.codTipoMascota) === tipoActivo
        );
    }

    // 4. Filtrar por Cliente (Nombre, Apellido o DNI)
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

// ===== Inicializar búsqueda (COMPLETO) =====
function initBusqueda() {
    // Búsqueda por Mascota (Existente)
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
    
    // Búsqueda por Cliente (Dueño)
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


// ===== Render filtros por tipo (RE-IMPLEMENTADO) =====
function renderFiltroTipoMascota() {
    const cont = $('#filtroTipoMascota');
    if (!cont) return;

    cont.innerHTML = '';

    // Botón "Todos"
    const btnTodos = document.createElement('button');
    btnTodos.className = 'btn btn-outline-info';
    btnTodos.textContent = 'Todos';
    btnTodos.dataset.tipo = '';
    cont.appendChild(btnTodos);

    // Botones dinámicos por cada tipo
    TipoMascota.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-info';
        btn.textContent = t.nombre;         
        btn.dataset.tipo = String(t.codTipoMascota); // Lo guardamos como string para comparar
        cont.appendChild(btn);
    });

    const buttons = cont.querySelectorAll('button');
    // Si hay botones, activa 'Todos' al inicio
    if (buttons.length) buttons[0].classList.add('active'); 

    // Eventos de filtrado por tipo
    buttons.forEach(b => {
        b.addEventListener('click', () => {
            buttons.forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            tipoActivo = b.dataset.tipo; // guardamos codTipoMascota
            filtrarMascotasCombinado();  // filtramos
        });
    });
}

// ===== Render mascotas (existente) =====
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

// ===== Cargar tipos de mascota (Existente) =====
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

// ===== Cargar mascotas (Existente) =====
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
        cargarMascotas()
    ]);

    initBusqueda();
}

document.addEventListener('DOMContentLoaded', initClientes);
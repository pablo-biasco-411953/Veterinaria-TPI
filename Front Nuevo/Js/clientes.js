(function () {
    // ====== Utilidades ======
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);
    const norm = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');


    if (typeof setUserBadgeFromSession === 'function') setUserBadgeFromSession();

    //Imagenes y tamaños de las mascotas
    const defaultsPorNombre = {
        'Luna': { tamano: 'chico', foto: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&q=80' },
        'Rocky': { tamano: 'grande', foto: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&q=80' },
        'Mila': { tamano: 'mediano', foto: 'https://p4.wallpaperbetter.com/wallpaper/177/95/581/pitbull-dog-animals-glasses-wallpaper-preview.jpg' },
    };

    // Estudios de las mascotas prueba
    const Estudios = {
        1: [{ fecha: '2025-10-05', tipo: 'Radiografía tórax' }, { fecha: '2025-08-22', tipo: 'Control general' }],
        2: [{ fecha: '2025-09-28', tipo: 'Vacunación antirrábica' }],
        3: [{ fecha: '2025-10-12', tipo: 'Hemograma' }, { fecha: '2025-07-02', tipo: 'Control general' }]
    };

    const mascotasExt = Mascota.map(m => {
        const def = defaultsPorNombre[m.nombre] || {};
        return {
            ...m,
            tamano: def.tamano || 'mediano',
            foto: def.foto || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80'
        };
    });

    function ultimoEstudio(id_mascota) {
        const arr = Estudios[id_mascota] || [];
        if (!arr.length) return '—';
        const ultimo = [...arr].sort((a, b) => (b.fecha).localeCompare(a.fecha))[0];
        return `${ultimo.fecha} · ${ultimo.tipo}`;
    }


    const grid = $('#gridMascotas');
    const count = $('#count');
    const qInput = $('#q');
    const btnClear = $('#clearQ');
    const sizeBtns = $$('.btn-group [data-size]');

    let filtros = { q: '', size: '' };

    function render(lista) {
        grid.innerHTML = '';
        lista.forEach((m, idx) => {
            const cliente = Cliente.find(c => c.id_cliente === m.id_cliente);
            const cliNombre = cliente ? `${cliente.nombre} ${cliente.apellido}` : '—';
            const cliTel = cliente?.telefono || '—';
            const cliMail = cliente?.email || '—';
            const collId = `pet-${m.id_mascota}-${idx}`;

            const col = document.createElement('div');
            col.className = 'col-12 col-sm-6 col-lg-4';

            col.innerHTML = `
        <div class="card pet-card h-100">
          <button class="pet-card-btn text-start" type="button" data-bs-toggle="collapse" data-bs-target="#${collId}" aria-expanded="false" aria-controls="${collId}">
            <div class="pet-cover">
              <img src="${m.foto}" alt="${m.nombre}" loading="lazy" />
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <h5 class="mb-0">${m.nombre}</h5>
                <span class="badge text-bg-secondary text-uppercase">${m.tamano}</span>
              </div>
              <div class="text-secondary small">${nombreCliente(m.id_cliente)}</div>
            </div>
          </button>

          <div id="${collId}" class="collapse">
            <div class="card-body border-top small">
              <div class="mb-1"><i class="bi bi-person"></i> <strong>Tutor:</strong> ${cliNombre}</div>
              <div class="mb-1"><i class="bi bi-telephone"></i> <strong>Tel:</strong> ${cliTel}</div>
              <div class="mb-1"><i class="bi bi-envelope"></i> <strong>Mail:</strong> ${cliMail}</div>
              <div class="mb-1"><i class="bi bi-clipboard2-pulse"></i> <strong>Último estudio:</strong> ${ultimoEstudio(m.id_mascota)}</div>
            </div>
          </div>
        </div>
      `;
            grid.appendChild(col);
        });

        count.textContent = `${lista.length}`;
    }

    function aplicarFiltros() {
        const q = norm(filtros.q);
        const size = filtros.size;

        let lista = [...mascotasExt];

        if (q) {
            lista = lista.filter(m => norm(m.nombre).includes(q));
        }
        if (size) {
            lista = lista.filter(m => m.tamano === size);
        }

        // Orden alfabético por nombre de mascota
        lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

        render(lista);
    }

    // ====== Eventos ======
    qInput.addEventListener('input', () => {
        filtros.q = qInput.value;
        aplicarFiltros();
    });

    btnClear.addEventListener('click', () => {
        qInput.value = '';
        filtros.q = '';
        aplicarFiltros();
        qInput.focus();
    });

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // marcar activo
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            filtros.size = btn.getAttribute('data-size') || '';
            aplicarFiltros();
        });
    });

    // init: “Todos” activo
    sizeBtns[0].classList.add('active');
    aplicarFiltros();
})();

// === PERFIL: menú desplegable ===
(function () {
    const btnPerfil = document.getElementById('btnPerfil');
    const menu = document.getElementById('menuPerfil');

    if (!btnPerfil || !menu) return;

    btnPerfil.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('d-none');
    });

    document.addEventListener('click', () => {
        if (!menu.classList.contains('d-none')) {
            menu.classList.add('d-none');
        }
    });

    // Cerrar sesión
    const btnCerrar = document.getElementById('btnCerrarSesion');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            sessionStorage.removeItem('dogtorUser');
            window.location.href = '../Html/index.html';
        });
    }

    // Editar perfil (placeholder)
    const btnEditar = document.getElementById('btnEditarPerfil');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            alert('Función "Editar perfil" en desarrollo.');
        });
    }

    // Cambiar clave (placeholder)
    const btnClave = document.getElementById('btnCambiarClave');
    if (btnClave) {
        btnClave.addEventListener('click', () => {
            alert('Función "Cambiar contraseña" en desarrollo.');
        });
    }
})();


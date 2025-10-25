(function () {
    // ====== Refs UI ======
    const tbody = document.getElementById('tablaTurnos');
    const totalLbl = document.getElementById('totalTurnos');
    const fechaInput = document.getElementById('filtroFecha');
    const estadoSelect = document.getElementById('filtroEstado');
    const textoInput = document.getElementById('filtroTexto');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const btnNuevo = document.getElementById('btnNuevo');

    // Modal + form
    const modalEl = document.getElementById('modalTurno');
    const modal = new bootstrap.Modal(modalEl);
    const form = document.getElementById('formTurno');

    const modoExistente = document.getElementById('modoExistente');
    const modoNuevo = document.getElementById('modoNuevo');
    const bloqueExistente = document.getElementById('bloqueExistente');
    const bloqueNuevo = document.getElementById('bloqueNuevo');

    // existente
    const selMascota = document.getElementById('tMascota');
    const inpTutor = document.getElementById('tTutor');

    // nuevo cliente/mascota
    const nCliNombre = document.getElementById('nCliNombre');
    const nCliApellido = document.getElementById('nCliApellido');
    const nCliEmail = document.getElementById('nCliEmail');
    const nCliTel = document.getElementById('nCliTel');

    const nMasNombre = document.getElementById('nMasNombre');
    const nMasRaza = document.getElementById('nMasRaza');
    const nMasTipo = document.getElementById('nMasTipo');
    const nMasSexo = document.getElementById('nMasSexo');

    // turno
    const inpFecha = document.getElementById('tFecha');
    const selHora = document.getElementById('tHora');
    const selAtencion = document.getElementById('tAtencion');
    const selEstado = document.getElementById('tEstado');
    const alertBox = document.getElementById('tAlert');

    // ====== Utils ======
    const norm = (s) => (s || '').toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    function showError(msg) {
        alertBox.textContent = msg;
        alertBox.classList.remove('d-none');
    }
    function clearError() {
        alertBox.textContent = '';
        alertBox.classList.add('d-none');
    }

    const nextId = (arr, prop) => arr.length ? Math.max(...arr.map(x => x[prop])) + 1 : 1;

    function clienteDeMascota(id_mascota) {
        const m = Mascota.find(x => x.id_mascota === Number(id_mascota));
        if (!m) return null;
        return Cliente.find(c => c.id_cliente === m.id_cliente) || null;
    }

    // disponibilidad de turnos 
    function generarSlotsBase() {
        const slots = [];
        for (let h = 9; h < 12; h++) {
            slots.push(`${String(h).padStart(2, '0')}:00`);
            slots.push(`${String(h).padStart(2, '0')}:30`);
        }
        return slots;
    }
    function horasOcupadasEnFecha(fecha) {
        return new Set(Turno.filter(t => t.fecha === fecha).map(t => t.hora));
    }
    function disponibilidadParaFecha(fecha) {
        const delDia = Disponibilidad.filter(d => d.fecha === fecha).map(d => d.hora_desde);
        return delDia.length ? delDia : generarSlotsBase();
    }
    function cargarHorasLibres(fecha) {
        selHora.innerHTML = '';
        if (!fecha) return;
        const ocupadas = horasOcupadasEnFecha(fecha);
        const slots = disponibilidadParaFecha(fecha);
        slots.filter(h => !ocupadas.has(h)).forEach(h => {
            const o = document.createElement('option');
            o.value = o.textContent = h;
            selHora.appendChild(o);
        });
        if (!selHora.options.length) {
            const o = document.createElement('option');
            o.value = ''; o.textContent = 'Sin horarios libres';
            selHora.appendChild(o);
        }
    }

    // ====== Listado ======
    function renderTurnos(lista) {
        tbody.innerHTML = '';
        lista.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${t.fecha}</td>
        <td>${t.hora}</td>
        <td>${nombreMascota(t.id_mascota)}</td>
        <td>${nombreCliente(t.id_cliente)}</td>
        <td>${nombreAtencion(t.id_tipo_atencion)}</td>
        <td><span class="badge ${badgeEstado(t.estado)}">${t.estado}</span></td>
      `;
            tbody.appendChild(tr);
        });
        totalLbl.textContent = `${lista.length} turno(s)`;
    }

    function aplicarFiltros() {
        const fecha = fechaInput?.value || '';
        const estado = estadoSelect?.value || '';
        const q = norm(textoInput?.value || '');

        let lista = [...Turno];
        if (fecha) lista = lista.filter(t => t.fecha === fecha);
        if (estado) lista = lista.filter(t => t.estado === estado);
        if (q) {
            lista = lista.filter(t => {
                const mas = norm(nombreMascota(t.id_mascota));
                const cli = norm(nombreCliente(t.id_cliente));
                return mas.includes(q) || cli.includes(q);
            });
        }
        lista.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
        renderTurnos(lista);
    }

    // ====== Eventos de filtros ======
    textoInput.addEventListener('input', aplicarFiltros);
    fechaInput.addEventListener('change', aplicarFiltros);
    estadoSelect.addEventListener('change', aplicarFiltros);
    btnLimpiar.addEventListener('click', () => {
        if (textoInput) textoInput.value = '';
        if (fechaInput) fechaInput.value = '';
        if (estadoSelect) estadoSelect.value = '';
        aplicarFiltros();
        textoInput?.focus();
    });

    // ====== Modal ======
    btnNuevo.addEventListener('click', () => {
        clearError();

        // poblar mascotas (existentes)
        selMascota.innerHTML = '';
        Mascota.forEach(m => {
            const o = document.createElement('option');
            o.value = m.id_mascota;
            o.textContent = `${m.nombre} — ${nombreCliente(m.id_cliente)}`;
            selMascota.appendChild(o);
        });
        // tutor
        const cli = clienteDeMascota(selMascota.value);
        inpTutor.value = cli ? `${cli.nombre} ${cli.apellido}` : '';

        // atenciones
        selAtencion.innerHTML = '';
        Tipo_Atencion.forEach(t => {
            const o = document.createElement('option');
            o.value = t.id_tipo_atencion;
            o.textContent = `${t.nombre} (${t.duracion_min}′)`;
            selAtencion.appendChild(o);
        });

        // fecha y horas
        inpFecha.value = (new Date()).toISOString().slice(0, 10);
        cargarHorasLibres(inpFecha.value);

        // modo por defecto: existente
        modoExistente.checked = true;
        bloqueExistente.classList.remove('d-none');
        bloqueNuevo.classList.add('d-none');

        // limpiar campos de nuevo cliente/mascota
        [nCliNombre, nCliApellido, nCliEmail, nCliTel, nMasNombre, nMasRaza].forEach(i => i.value = '');

        modal.show();
    });

    selMascota.addEventListener('change', () => {
        const cli = clienteDeMascota(selMascota.value);
        inpTutor.value = cli ? `${cli.nombre} ${cli.apellido}` : '';
    });

    inpFecha.addEventListener('change', () => {
        cargarHorasLibres(inpFecha.value);
    });

    // cambiar modo alta
    modoExistente.addEventListener('change', toggleModo);
    modoNuevo.addEventListener('change', toggleModo);
    function toggleModo() {
        if (modoNuevo.checked) {
            bloqueNuevo.classList.remove('d-none');
            bloqueExistente.classList.add('d-none');
        } else {
            bloqueExistente.classList.remove('d-none');
            bloqueNuevo.classList.add('d-none');
        }
    }

    // ====== Guardar ======
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearError();

        // datos comunes del turno
        const fecha = inpFecha.value;
        const hora = selHora.value;
        const id_tipo_atencion = Number(selAtencion.value);
        const estado = selEstado.value;

        if (!fecha || !hora || !id_tipo_atencion || !estado) {
            showError('Completá todos los campos del turno.');
            return;
        }
        if (hora === '') {
            showError('No hay horarios libres para la fecha seleccionada.');
            return;
        }
        if (Turno.some(t => t.fecha === fecha && t.hora === hora)) {
            showError('Ya existe un turno en ese horario.');
            return;
        }

        let id_cliente, id_mascota;

        if (modoNuevo.checked) {
            // Validar nuevo cliente y mascota
            if (!nCliNombre.value.trim() || !nCliApellido.value.trim()) {
                showError('Completá nombre y apellido del tutor.');
                return;
            }
            if (!nMasNombre.value.trim()) {
                showError('Completá el nombre de la mascota.');
                return;
            }
            // crear cliente
            id_cliente = nextId(Cliente, 'id_cliente');
            Cliente.push({
                id_cliente,
                nombre: nCliNombre.value.trim(),
                apellido: nCliApellido.value.trim(),
                email: nCliEmail.value.trim(),
                telefono: nCliTel.value.trim()
            });
            // crear mascota
            id_mascota = nextId(Mascota, 'id_mascota');
            Mascota.push({
                id_mascota,
                id_cliente,
                id_tipo_mascota: Number(nMasTipo.value),
                nombre: nMasNombre.value.trim(),
                raza: nMasRaza.value.trim(),
                sexo: nMasSexo.value
            });
        } else {
            // existente
            id_mascota = Number(selMascota.value);
            const m = Mascota.find(x => x.id_mascota === id_mascota);
            if (!m) {
                showError('Seleccioná una mascota válida.');
                return;
            }
            id_cliente = m.id_cliente;
        }

        // crear turno
        const id_turno = nextId(Turno, 'id_turno');
        Turno.push({
            id_turno,
            id_mascota,
            id_cliente,
            id_tipo_atencion,
            fecha,
            hora,
            estado
        });

        // asegurar que exista slot de disponibilidad (para que otras pantallas lo vean)
        const existeDisp = Disponibilidad.some(d => d.fecha === fecha && d.hora_desde === hora);
        if (!existeDisp) {
            // 30 minutos por defecto
            const [hh, mm] = hora.split(':').map(n => parseInt(n, 10));
            const endMin = hh * 60 + mm + 30;
            const h2 = String(Math.floor(endMin / 60)).padStart(2, '0');
            const m2 = String(endMin % 60).padStart(2, '0');
            Disponibilidad.push({
                id_disponibilidad: nextId(Disponibilidad, 'id_disponibilidad'),
                fecha,
                hora_desde: hora,
                hora_hasta: `${h2}:${m2}`,
                estado: 'disponible'
            });
        }

        aplicarFiltros();
        modal.hide();

        // feedback
        const ok = document.createElement('div');
        ok.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
        ok.style.zIndex = 2000;
        ok.textContent = 'Turno registrado correctamente.';
        document.body.appendChild(ok);
        setTimeout(() => ok.remove(), 1600);
    });

    // ====== Init ======
    if (typeof setUserBadgeFromSession === 'function') setUserBadgeFromSession();
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


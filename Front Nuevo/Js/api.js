const API_URL = 'https://localhost:7033/api';

// USUARIO
export async function registerUser(userData) {
    return fetch(`${API_URL}/User/register`, {  
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
}

export async function loginUser(credentials) {
    return fetch(`${API_URL}/User/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
}

export async function getUserByUsername(username) {
    return fetch(`${API_URL}/User/${username}`);
}

// MASCOTA
export async function getAllMascotas() {
    return fetch(`${API_URL}/Mascotas`);
}

export async function getMascotaById(id) {
    return fetch(`${API_URL}/Mascotas/id/${id}`);
}

export async function getMascotaByClienteId(clienteId) {
    return fetch(`${API_URL}/Mascotas/cliente/${clienteId}`);
}

// api.js
export async function createMascota(mascota, imagenArchivo) {
    // 🟢 FormData en lugar de JSON
    const formData = new FormData();

    // Agregamos los campos del objeto mascota
    for (const key in mascota) {
        if (mascota[key] !== undefined && mascota[key] !== null) {
            formData.append(key, mascota[key]);
        }
    }

    // Agregamos el archivo si existe
    if (imagenArchivo) {
        formData.append('imagenArchivo', imagenArchivo);
    }

    return fetch(`${API_URL}/Mascotas`, {
        method: 'POST',
        body: formData // ⚠️ No usar JSON.stringify ni Content-Type
    });
}


export async function updateMascota(id, mascotaData) {
    return fetch(`${API_URL}/Mascotas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mascotaData)
    });
}

export async function deleteMascota(id) {
    return fetch(`${API_URL}/Mascotas/${id}`, {
        method: 'DELETE'
    });
}

export async function getTiposMascota() {
    return fetch(`${API_URL}/Mascotas/Tipos`);
}

// ATENCION

export async function getAllAtenciones() {
    return fetch(`${API_URL}/Turnos`);
}

// ACTUALIZAR ESTADO DEL TURNO
export async function actualizarEstadoTurno(codDisponibilidad, nuevoEstado) {
    return fetch(`${API_URL}/Turnos/estado/${codDisponibilidad}?nuevoEstado=${nuevoEstado}`, {
        method: 'PUT'
    });
}


// Dashboard
export async function getTopServiciosReservados() { 
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}/Dashboard/GetTopServiciosReservados`);
}

export async function getAtencionByClienteId(id) {
    return fetch(`${API_URL}/Turnos/AtencionesxCliente/${id}`);
}

export async function getTurnosDisponibles() {
    return fetch(`${API_URL}/Turnos/disponibilidad/`);
}

export async function createAtencion(atencionData, codDisponibilidad) {
    return fetch(`${API_URL}/Turnos/insertar/${codDisponibilidad}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(atencionData) 
    });
}

export async function deleteAtencion(id) {
    return fetch(`${API_URL}/Atencion/${id}`, {
        method: 'DELETE'
    });
}

export async function getTiposAtencion() {
    return fetch(`${API_URL}/Turnos/Tipos`);
}

// TURNOS x VETERINARIO
export async function getTurnosByVeterinarioId(veterinarioId) {
    return fetch(`${API_URL}/Turnos/AtencionesxVeterinario/${veterinarioId}`);
}


// DISPONIBILIDAD
export async function getDisponibilidad() {
    return fetch(`${API_URL}/Turnos/disponibilidad`);
}



export async function getDisponibilidadHora() {
    return fetch(`${API_URL}/Atencion/Disponibilidad/Hora`);
}

// CLIENTES
export async function getAllClientes() {
    return fetch(`${API_URL}/Clientes`);
}

export async function getClientesByDNI(dni) {
    return fetch(`${API_URL}/Clientes/${dni}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    });
}

export async function createCliente(cliente) {
  return fetch(`${API_URL}/Clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente)
  });
}

// RECUPERACIÓN DE CONTRASEÑA
export async function forgotPassword(email) {
    return fetch(`${API_URL}/User/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email)
    });
}

export async function resetPassword(token, nuevaContraseña) {
    return fetch(`${API_URL}/User/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, NuevaContraseña: nuevaContraseña }) // <-- mayúscula
    });
}
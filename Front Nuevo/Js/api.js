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
export async function getAllMascotas(userId) {
    return fetch(`${API_URL}/Mascota/${userId}`);
}

export async function getMascotaById(id) {
    return fetch(`${API_URL}/Mascota/id/${id}`);
}

export async function getMascotaByClienteId(userId) {
    return fetch(`${API_URL}/Mascota/cliente/${userId}`);
}



export async function createMascota(mascotaData) {
    return fetch(`${API_URL}/Mascota`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mascotaData)
    });
}

export async function updateMascota(id, mascotaData) {
    return fetch(`${API_URL}/Mascota/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mascotaData)
    });
}

export async function deleteMascota(id) {
    return fetch(`${API_URL}/Mascota/${id}`, {
        method: 'DELETE'
    });
}

export async function getTiposMascota() {
    return fetch(`${API_URL}/Mascota/Tipos`);
}


// ATENCION

export async function getAllAtenciones() {
    return fetch(`${API_URL}/Turnos`);
}

export async function getProximasAtenciones(userId) {
    console.log(userId)
    return fetch(`${API_URL}/Turnos/AtencionesxCliente/${userId}`);
}

export async function getAtencionByClienteId(id) {
    return fetch(`${API_URL}/Turnos/AtencionesxCliente/${id}`);
}

export async function getTurnosDisponibles() {
    return fetch(`${API_URL}/Turnos/disponibilidad/`);
}

export async function insertAtencion(atencionData, codDisponibilidad) {
    return fetch(`${API_URL}/Atencion/${codDisponibilidad}`, {
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
    return fetch(`${API_URL}/Atencion/Tipos`);
}

// DISPONIBILIDAD
export async function getDisponibilidadFecha() {
    return fetch(`${API_URL}/Atencion/Disponibilidad/Fecha`);
}

export async function getDisponibilidadHora() {
    return fetch(`${API_URL}/Atencion/Disponibilidad/Hora`);
}

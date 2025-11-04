const API_URL = 'https://localhost:7033/api'; 

function getAuthHeaders(contentType = 'application/json') {
    const token = localStorage.getItem('token'); 
    const headers = {
        'Accept': 'application/json'
    };
    if (contentType) {
        headers['Content-Type'] = contentType;
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// USUARIO 

export async function registerUser(userData) {
    return fetch(`${API_URL}/User/register`, {  
        method: 'POST',
        headers: getAuthHeaders(), 
        body: JSON.stringify(userData)
    });
}

export async function loginUser(credentials) {
    return fetch(`${API_URL}/User/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(credentials)
    });
}

export async function getUserByUsername(username) {
    return fetch(`${API_URL}/User/${username}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
}

// RECUPERACIoN DE CONTRASEÑA (Públicas)
export async function forgotPassword(email) {
    return fetch(`${API_URL}/User/forgot-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(email)
    });
}

export async function resetPassword(token, nuevaContraseña) {
    return fetch(`${API_URL}/User/reset-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ token, NuevaContraseña: nuevaContraseña })
    });
}


// MASCOTA

export async function getAllMascotas() {
    return fetch(`${API_URL}/Mascotas`, {
        method: 'GET',
        headers: getAuthHeaders()
})}

export async function getMascotaById(id) {
    return fetch(`${API_URL}/Mascotas/id/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
}

export async function getMascotaByClienteId(clienteId) {
    return fetch(`${API_URL}/Mascotas/cliente/${clienteId}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
}

export async function createMascota(mascota, imagenArchivo) {
    const formData = new FormData();

    for (const key in mascota) {
        if (mascota[key] !== undefined && mascota[key] !== null) {
            formData.append(key, mascota[key]);
        }
    }

    if (imagenArchivo) {
        formData.append('imagenArchivo', imagenArchivo);
    }

    return fetch(`${API_URL}/Mascotas`, {
        method: 'POST',
        headers: getAuthHeaders(null), 
        body: formData
    });
}


export async function updateMascota(id, mascotaData) {
    return fetch(`${API_URL}/Mascotas/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(mascotaData)
    });
}

export async function deleteMascota(id) {
    return fetch(`${API_URL}/Mascotas/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders() 
    });
}

export async function getTiposMascota() {
    return fetch(`${API_URL}/Mascotas/Tipos`, {
        method: 'GET',
        headers: getAuthHeaders()
})
}

// ATENCION / TURNOS / DISPONIBILIDAD
export async function getAllAtenciones() {
    return fetch(`${API_URL}/Turnos`, {
        method: 'GET',
        headers: getAuthHeaders() 
    });
}

export async function actualizarEstadoTurno(codDisponibilidad, nuevoEstado) {
    return fetch(`${API_URL}/Turnos/estado/${codDisponibilidad}?nuevoEstado=${nuevoEstado}`, {
        method: 'PUT',
        headers: getAuthHeaders() 
    });
}

export async function getAtencionByClienteId(id) {
    return fetch(`${API_URL}/Turnos/AtencionesxCliente/${id}`, {
        method: 'GET',
        headers: getAuthHeaders() 
    });
}

export async function getTurnosDisponibles() {
    return fetch(`${API_URL}/Turnos/disponibilidad/`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
}

export async function deleteAtencion(id) {
    return fetch(`${API_URL}/Atencion/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
}

export async function getTiposAtencion() {
    return fetch(`${API_URL}/Turnos/Tipos`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
}

export async function getTurnosByVeterinarioId(veterinarioId) {
    return fetch(`${API_URL}/Turnos/AtencionesxVeterinario/${veterinarioId}`, {
        method: 'GET',
        headers: getAuthHeaders() 
    });
}

export async function createAtencion(atencionData, codDisponibilidad) {
    return fetch(`${API_URL}/Turnos/insertar/${codDisponibilidad}`, {  
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(atencionData)
    });
}

export async function getDisponibilidad() {
    return fetch(`${API_URL}/Turnos/disponibilidad`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
}

export async function getDisponibilidadHora() {
    return fetch(`${API_URL}/Atencion/Disponibilidad/Hora`, {
        method: 'GET',
        headers: getAuthHeaders() 
    });
}

// CLIENTES (Autenticadas)

export async function getAllClientes() {
    return fetch(`${API_URL}/Clientes`, {
        method: 'GET',
        headers: getAuthHeaders() 
    });
}

export async function getClientesByDNI(dni) {
    return fetch(`${API_URL}/Clientes/${dni}`, {
        method: 'GET',
        headers: getAuthHeaders() 
    });
}

export async function createCliente(cliente) {
  return fetch(`${API_URL}/Clientes`, {
    method: 'POST',
    headers: getAuthHeaders(), 
    body: JSON.stringify(cliente)
  });
}

// DASHBOARD (Autenticadas - Admin)


export async function getTopServiciosReservados(mes = null) {
    let url = `${API_URL}/Dashboard/GetTopServiciosReservados`;    
    if (mes) {
        url += `?mes=${mes}`;
    }

    return fetch(url, {
        method: 'GET',
        headers: getAuthHeaders() 
    });
}

export async function getFacturacionSemanal(fecMin, fecMax) {
const url = `${API_URL}/ServicioMasFacturado?fecMin=${fecMin}&fecMax=${fecMax}`;    
    const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders() 
    });

    if (!response.ok) {
        throw new Error('Error al obtener la facturación semanal');
    }

    return response.json();
}

export async function getTopVeterinarios(fechaInicio = null, fechaFin = null, topN = 5) {
    const urlBase = `${API_URL}/VeterinarioConMasTurnos`;
    const params = new URLSearchParams();
    console.log(urlBase)
    if (fechaInicio) {
        params.append('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
        params.append('fechaFin', fechaFin); 
    }
    if (topN !== 5) {
        params.append('topN', topN.toString());
    }
   const url = params.toString() ? `${urlBase}?${params.toString()}` : urlBase;
    
    console.log("URL de API para Top Veterinarios:", url); // <--- AÑADE ESTO
    
    return fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
    });
}
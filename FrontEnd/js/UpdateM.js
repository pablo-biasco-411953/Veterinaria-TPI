
const API_MASCOTAS_URL = 'https://localhost:7186/api/Mascota';
const API_ESPECIES_URL = 'https://localhost:7186/api/tiposMascota';
const API_UPDATE_MASCOTA_URL = 'https://localhost:7186/api/Mascota';
// Elementos del DOM
const mascotaSelect = document.getElementById('mascotaSelect');
const especieSelect = document.getElementById('especieSelect');
const formModificar = document.getElementById('form-modificar');

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

let mascota;

console.log("ID de la mascota:", id);
// Cargar mascotas en el combobox
async function cargarMascotas() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_MASCOTAS_URL}/${id}` ,{
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Error al obtener las mascotas');
        
        mascota = await response.json();

        cargarEspecies();
        cargarDatosMascota();
        
    } catch (error) {
        console.error('Error al cargar mascotas:', error);
    }
}

function cargarDatosMascota(){
    document.getElementById('nombre').value = mascota.nombre;
    document.getElementById('edad').value = mascota.edad;
}

// Cargar especies en el combobox 
async function cargarEspecies() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(API_ESPECIES_URL,{
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })

        if (!response.ok) throw new Error('Error al obtener las especies');
        
        const especies = await response.json();
        especies.forEach(especie => {
            const option = document.createElement('option');
            option.value = especie. codTipo;  // El valor es el ID de la especie
            option.textContent = especie.nombre;  // Muestra el nombre de la especie

            if(mascota.codTipo == especie.codTipo){
                option.selected = true;
            }
            especieSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar especies:', error);
    }
}

// Enviar la actualización
formModificar.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    // Obtener los valores seleccionados y los campos
    const nombre = document.getElementById('nombre').value;
    const edad = parseInt(document.getElementById('edad').value);
    console.log(document.getElementById('especieSelect').value);
    
    const codTipo = document.getElementById('especieSelect').value;
    const codCliente = mascota.codCliente;

    console.log('Datos a enviar:', { nombre, edad, codTipo, codCliente });
    

    if ( !nombre || !edad || !codTipo) {
        alert('Por favor, complete todos los campos');
        return;
    }

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_UPDATE_MASCOTA_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nombre, edad, codTipo, codCliente })
        });
    
        console.log(response);
    
        if (!response.ok) {
            throw new Error('Error al actualizar la mascota');
        }
    
        // Verifica si el contenido de la respuesta es JSON
        const contentType = response.headers.get('Content-Type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            // Si es JSON, procesarlo normalmente
            data = await response.json();
        } else {
            // Si es un mensaje en texto plano, leerlo como texto
            data = await response.text();
        }
    
        alert(`Mascota actualizada con éxito: ${data}`);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error al actualizar la mascota:', error);
        alert('Ocurrió un error al actualizar la mascota');
    }
    
});

// Cargar las mascotas y especies cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    cargarMascotas();
});


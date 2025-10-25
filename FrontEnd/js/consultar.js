function inicializar_consultar() {
    const API_URL = 'https://localhost:7186/api';
    let tipos;

    // Función para obtener las mascotas
    async function fetchMascotas() {  
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/Mascota`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const mascotas = await response.json();
            cargarMascotas(mascotas);
            
        } catch (error) {
            console.error('Error al obtener las mascotas:', error);
        }
    }

    // Función para cargar los tipos de mascota
    async function cargarTipo() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/tiposMascota`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            tipos = await response.json();
            console.log(tipos);

            // Llamamos a fetchMascotas después de cargar los tipos
            fetchMascotas();

        } catch (error) {
            console.error('Error al obtener los tipos de mascota:', error);
        }
    }

    function showTipo(codTipo) {
        const tipo = tipos.find(tipo => tipo.codTipo == codTipo);
        return tipo ? tipo.nombre : "Tipo no encontrado";
    }

    // Función para crear las filas de la tabla
    function cargarMascotas(mascotas) {
        const tbody = document.getElementById('table');
        
        tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevas filas
    
        mascotas.forEach(mascosta => {
            const row = document.createElement('tr');
    
            // // Columna Número
            // const id = document.createElement('td');
            // id.textContent = mascosta.codMascota;
            // row.appendChild(id);
    
            // Columna Fecha
            const nombre = document.createElement('td');
            nombre.textContent = mascosta.nombre;
            row.appendChild(nombre);
    
            // Columna Modelo
            const edad = document.createElement('td');
            edad.textContent = mascosta.edad;
            row.appendChild(edad);
    
            // Columna Tipo
            const tipo = document.createElement('td');
            tipo.textContent = showTipo(mascosta.codTipo); 
            row.appendChild(tipo);
            
            // Columna Acciones (Detalle y Eliminar)
            const accionesTd = document.createElement('td');

            // Boton editar, aca se tiene que hacer la funcionalidad para llevar a otra pantalla
            // -----------------------------------------------------------------------------------------
            // Debe direccionar a otra pantalla, se debe enviar el id de la mascota para tenerlo para editarlo
            const editarBtn = document.createElement('button');
            editarBtn.classList.add('btn', 'btn-primary', 'btn-sm', 'me-2');
            editarBtn.textContent = 'Editar';                       
            let idMascota= mascosta.codMascota
            editarBtn.onclick = ()=> {
                window.location.href = `updateM.html?id=${idMascota}`;
            };

          
            // Botón Eliminar
            const eliminarBtn = document.createElement('button');
            eliminarBtn.classList.add('btn', 'btn-danger', 'btn-sm');
            eliminarBtn.textContent = 'Eliminar';
            eliminarBtn.addEventListener('click', () => {
                Swal.fire({
                    title: "¿Estás seguro que quieres eliminar la mascota?",
                    text: "Esta acción no se puede deshacer.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Eliminar",
                    cancelButtonText: "Cancelar"
                  }).then((result) => {
                    if (result.isConfirmed) {
                        eliminarMascota(mascosta.codMascota); 
                    }
                  });
            });
    
            accionesTd.appendChild(editarBtn);
            accionesTd.appendChild(eliminarBtn);
            row.appendChild(accionesTd);
    
            // Agregar la fila a la tabla
            tbody.appendChild(row);
        });
    }
    
    // Función para eliminar una mascota
    async function eliminarMascota(id) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/Mascota/${id}`, { 
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                Swal.fire({
                    title: "Eliminado!",
                    text: "La mascosta ha sido eliminada exitosamente",
                    icon: "success"
                  });
                fetchMascotas(); // Recargar las mascotas después de eliminar
            } else {
                Swal.fire({
                    title: "Error!",
                    text: "Hubo un error, y la mascota no pudo ser eliminada",
                    icon: "error"
                  });
            }
        } catch (error) {
            console.error('Error al eliminar la mascota:', error);
            Swal.fire({
                title: "Error!",
                text: "Hubo un error, y la mascota no pudo ser eliminada",
                icon: "error"
              });
        }
    }

    // Llamar a cargarTipo para cargar los tipos de mascota y luego cargar las órdenes
    cargarTipo();
}

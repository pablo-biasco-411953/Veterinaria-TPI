function inicializar_consultar_turnos() {
    const API_URL = 'https://localhost:7186/api';

    // Función para obtener turnos
     async function fetchTurnos() {  
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("https://localhost:7186/api/Veterinaria/api/atencionPorCliente", {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const turnos = await response.json();
            console.log(turnos);
            
            cargarTurnos(turnos);
            } else {
                alert('Error al agregar el turno');
            }
            
            
        } catch (error) {
            console.error('Error al obtener los turnos:', error);
        }
     }
     fetchTurnos();

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
            console.error('Error al obtener los turnos:', error);
        }
    }

    // Función para crear las filas de la tabla
    function cargarTurnos(turnos) {
        const tbody = document.getElementById('table');
        tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevas filas
    
        turnos.forEach(turnos => {
            const row = document.createElement('tr');

            // Columna codigo
            // const codTurno = document.createElement('td');
            // codTurno.textContent = turnos.codTurno;
            // row.appendChild(codTurno);
        
            // Columna Fecha
            const Fecha = document.createElement('td');
            const fechaCompleta = new Date(turnos.codDisponibilidadNavigation.fecha);
            const fechaCorta = fechaCompleta.toLocaleDateString();
            Fecha.textContent = fechaCorta;
            row.appendChild(Fecha);
    
            // Columna Mascota
            const mascota = document.createElement('td');
            mascota.textContent = turnos.codMascotaNavigation.nombre;
           
            row.appendChild(mascota);
            
            // Columna Acciones (Detalle y Eliminar)
            const accionesTd = document.createElement('td');
          
            const eliminarBtn = document.createElement('button');
            eliminarBtn.classList.add('btn', 'btn-danger', 'btn-sm');
            eliminarBtn.textContent = 'Eliminar';
            eliminarBtn.addEventListener('click', () => {
                Swal.fire({
                    title: "¿Estás seguro que quieres eliminar el turno?",
                    text: "Esta acción no se puede deshacer.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Eliminar",
                    cancelButtonText: "Cancelar"
                  }).then((result) => {
                    if (result.isConfirmed) {
                        eliminarTurno(turnos.codAtencion); 
                    }
                  });
            });
            // Botón Eliminar
            // const eliminarBt = document.createElement('button');
            // eliminarBtn.classList.add('btn', 'btn-danger', 'btn-sm');
            // eliminarBtn.textContent = 'Eliminar';
            // eliminarBtn.addEventListener('click', () => {
            //     if (confirm('¿Estás seguro que deseas eliminar esta mascota?')) {
            //         console.log(turnos.codAtencion);
                    
            //         eliminarTurno(turnos.codAtencion); // Cambié a mascosta.codMascota
            //     }
            // });
            

            accionesTd.appendChild(eliminarBtn);
            row.appendChild(accionesTd);
    
            // Agregar la fila a la tabla
            tbody.appendChild(row);
        });
    }
    
    // Función para eliminar una mascota
    async function eliminarTurno(id) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/Veterinaria/${id}`, { 
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                Swal.fire({
                    title: "Eliminado!",
                    text: "El turno ha sido eliminado exitosamente",
                    icon: "success"
                  });
                fetchTurnos(); // Recargar las mascotas después de eliminar
            } else {
                Swal.fire({
                    title: "Error!",
                    text: "Hubo un error, y el turno no pudo ser eliminado",
                    icon: "error"
                  });
            } // Recargar las mascotas después de eliminar 
        } catch (error) {
            console.error('Error al eliminar el turno:', error);
            alert('Ocurrió un error al intentar eliminar el turno');
        }
    }
};

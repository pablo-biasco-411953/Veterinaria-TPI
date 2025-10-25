function inicializarCrearTurno() {
    // Espera hasta que el botón "Agregar al detalle" esté disponible
    const addDetailBtn = document.getElementById('addDetailBtn');
    if (!addDetailBtn) {
        console.error("El botón 'addDetailBtn' no se encontró en el DOM.");
        return;
    }

    addDetailBtn.addEventListener('click', function () {
        const tipoSelect = document.getElementById('cod_tipoA');    
        const codTipo= tipoSelect.value;
        const tipoName = tipoSelect.options[tipoSelect.selectedIndex].text;
        
        if (tipoSelect.selectedIndex > 0) {
            const tableBody = document.querySelector('#detailsTable tbody');
            const newRow = document.createElement('tr');

            newRow.innerHTML = `
                <td data-value="${codTipo}">${tipoName}</td>            
                <td><button class="btn btn-danger btn-sm remove-btn">Quitar</button></td>
            `;

            tableBody.appendChild(newRow);
            
            // Limpiar inputs después de agregar        
            tipoSelect.selectedIndex = 0;

            // Agregar evento al botón "Quitar"
            newRow.querySelector('.remove-btn').addEventListener('click', function () {
                newRow.remove();
            });
        } else {
            alert("Por favor, selecciona un tipo de atención válido.");
        }
    });

    // Obtener los elementos del formulario
    const form = document.getElementById('form-orden');
    const selectFecha = document.getElementById('cod_disponibilidadFechaHora');
    const selectMascota= document.getElementById('cod_mascotas');
    
    const selectTipos = document.getElementById('cod_tipoA');

    // Agregar un listener al formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Formulario enviado'); // Esto te ayudará a saber si el evento se activa

        // Obtener los valores del formulario          
        const fecha = parseInt(selectFecha.value); 
        const mascota = parseInt(selectMascota.value);
       

        // Recorrer la tabla de componentes
        const detalles = obtenerDetallesTabla();

        // Construir el cuerpo del POST sin el 'nro'
        const body = {
            codDisponibilidad: fecha,
            codMascota: mascota,
            detalleAtencions: detalles            
        };
        console.log("bodyyy", body)

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("https://localhost:7186/api/Veterinaria", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {                
                Swal.fire({
                    title: "Agregado!",
                    text: "El turno ha sido agregado exitosamente",
                    icon: "success"
                  });
                 form.reset();
                const tableBody = document.querySelector('#detailsTable tbody');
                tableBody.innerHTML="";
                cargar_combos();
            } else {
                Swal.fire({
                    title: "Error!",
                    text: "Hubo un error, y el turno no pudo ser agregado",
                    icon: "error"
                  });
            } 
              
              
            
        } catch (error) {
            console.error('Error:', error);
            alert('Ocurrió un error al intentar agregar el turno');
        }

        // Función para recorrer la tabla y obtener los detalles de la orden
    function obtenerDetallesTabla() {
        const tabla = document.getElementById('detailsTable');
        const filas = tabla.querySelectorAll('tbody tr');
        const detalles = [];

        filas.forEach(fila => {
            const id = parseInt(fila.children[0].getAttribute("data-value")); 
           
            detalles.push({
                codTipoA: id
            });
        });

        return detalles;
    }
    });

}






async function cargarTiposAtencion() {
    try {
        // Realiza la solicitud a la API
        const token = localStorage.getItem("token");
        const response = await fetch('https://localhost:7186/api/Veterinaria/GetTiposAtencion', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.error("Error al acceder al recurso protegido");
        }

        // Convierte la respuesta en formato JSON
        const tipos = await response.json();
        
        // Verifica que los datos se están recibiendo correctamente
        console.log(tipos); // Verifica en la consola

        // Selecciona el <select> donde se cargarán las opciones
        const $select = document.getElementById('cod_tipoA');
        
        // Limpia las opciones existentes
        $select.innerHTML = '';

        // Crear opción predeterminada
        const $optionDefault = document.createElement('option');
        $optionDefault.value = '';
        $optionDefault.textContent = 'Seleccione un tipo de atención';
        $optionDefault.disabled = true;
        $optionDefault.selected = true;
        $select.appendChild($optionDefault);

        // Agregar las opciones de los tipos de atención
        tipos.forEach(element => {
            const $option = document.createElement('option');
            $option.value = element.codTipoA;  // Usar CodTipoA como valor
            $option.textContent = element.descripcion;  // Mostrar la descripción
            $select.appendChild($option);
        });
    } catch (error) {
        console.error('Error al cargar los tipos de atención:', error);
    }
}

// Llamada a la función después de que la página esté completamente cargada
// document.addEventListener('DOMContentLoaded', () => {
//     cargarTiposAtencion();
// });
// // Llamar a cargarTiposAtencion cuando la página esté lista
// document.addEventListener('DOMContentLoaded', cargarTiposAtencion);

// Llamar a la API para cargar las mascotas
async function cargarMascotas() {
    try {
        const token = localStorage.getItem("token");
        // Realiza la solicitud para obtener las mascotas
        const response = await fetch('https://localhost:7186/api/Mascota', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            console.error("Error al acceder al recurso protegido");
        }

        // Convierte la respuesta en formato JSON
        const mascotas = await response.json();
        
        // Verifica que los datos se están recibiendo correctamente
        console.log(mascotas); // Verifica en la consola

        // Selecciona el <select> donde se cargarán las opciones
        const $select = document.getElementById('cod_mascotas');
        
        // Limpia las opciones existentes
        $select.innerHTML = '';

        // Crear opción predeterminada
        const $optionDefault = document.createElement('option');
        $optionDefault.value = '';
        $optionDefault.textContent = 'Seleccione su mascota';
        $optionDefault.disabled = true;
        $optionDefault.selected = true;
        $select.appendChild($optionDefault);

        // Agregar las opciones de las mascotas
        mascotas.forEach(element => {
            const $option = document.createElement('option');
            $option.value = element.codMascota;  // Usar CodMascota como valor
            $option.textContent = element.nombre;  // Mostrar el nombre de la mascota
            $select.appendChild($option);
        });
    } catch (error) {
        console.error("Error al cargar las mascotas:", error);
    }
}

// Cargar las mascotas cuando la página esté lista
// document.addEventListener('DOMContentLoaded', () => {
//     cargarMascotas();
// });
async function cargarDisponibilidadesFechaHora() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch('https://localhost:7186/api/Veterinaria/GetFecha', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            console.error("Error al acceder al recurso protegido");
        }
        const disponibilidades = await response.json();

        console.log(disponibilidades); // Verifica los datos recibidos

        const $selectFechaHora = document.getElementById('cod_disponibilidadFechaHora');
        $selectFechaHora.innerHTML = '';  // Limpiar las opciones del select

        // Opción predeterminada
        const $optionDefault = document.createElement('option');
        $optionDefault.value = '';
        $optionDefault.textContent = 'Seleccione una fecha y hora';
        $optionDefault.disabled = true;
        $optionDefault.selected = true;
        $selectFechaHora.appendChild($optionDefault);

        disponibilidades.forEach(element => {
            const $option = document.createElement('option');
            $option.value = element.codDisponibilidad;  // Usar codDisponibilidad como valor

            // Convertir la fecha en el formato dmy - hora
            const fecha = new Date(element.fecha);
            const dia = fecha.getDate().toString().padStart(2, '0');
            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Mes es 0-indexado
            const año = fecha.getFullYear();
            const hora = fecha.getHours().toString().padStart(2, '0');
            const minutos = fecha.getMinutes().toString().padStart(2, '0');

            // Formatear la fecha y hora como dmy - hora
            const fechaHoraFormateada = `${dia}/${mes}/${año} `;

            $option.textContent = fechaHoraFormateada;  // Mostrar la fecha y la hora formateada
            $selectFechaHora.appendChild($option);
        });
    } catch (error) {
        console.error('Error al cargar las fechas y horas:', error);
    }
}

// Cargar las fechas y horas cuando la página esté lista
// document.addEventListener('DOMContentLoaded', () => {
//     cargarDisponibilidadesFechaHora();
// });

// Llamar a la función de carga de datos al cargar la página
// document.addEventListener('DOMContentLoaded', () => {
//     cargarTiposAtencion();
//     cargarMascotas();
//     cargarDisponibilidadesFechaHora();
// });
function cargar_combos(){
    cargarTiposAtencion();
    cargarMascotas();
    cargarDisponibilidadesFechaHora();
}

// Función para registrar un nuevo turno
async function nuevoTurno() {
    const $divError = document.getElementById("error");
    const $divOk = document.getElementById("ok");

    const $tipos = document.getElementById("cod_tipoA");
    const $mascota = document.getElementById("cod_mascotas");
    const $disponibilidad = document.getElementById("cod_disponibilidadFechaHora");

    // Verificar si los valores de los elementos son válidos
    if (!$tipos.value || !$mascota.value || !$disponibilidad.value) {
        $divError.textContent = 'Por favor, complete todos los campos.';
        $divError.removeAttribute('hidden');
        return; // No proceder si falta algún campo
    }

    let data = {
        CodDisponibilidad: Number($disponibilidad.value),
        CodTipoA: Number($tipos.value),
        CodMascota: Number($mascota.value),
        
    };

    try {
        // Hacer la solicitud POST al servidor
        const response = await fetch('https://localhost:7231/api/Veterinaria', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Intentar parsear la respuesta como JSON
        let responseData;
        try {
            responseData = await response.json(); // Intentar parsear como JSON
        } catch (jsonError) {
            // Si no es JSON válido, tratar como texto plano
            responseData = await response.text(); 
        }

        console.log('Respuesta del servidor:', responseData);

        if (response.ok) {
            // Si la respuesta es exitosa, mostrar el mensaje de éxito
            $divOk.removeAttribute('hidden');
            document.querySelector('form').reset(); // Resetea el formulario
        } else {
            // Si la respuesta no es exitosa, mostrar el mensaje de error
            $divError.textContent = responseData || 'Hubo un problema al procesar el turno.';
            $divError.removeAttribute('hidden');
        }
    } catch (error) {
        // En caso de error en la solicitud
        console.error('Error:', error);
        $divError.textContent = 'Hubo un error al realizar la solicitud.';
        $divError.removeAttribute('hidden');
    }
}

// Función para cerrar los mensajes de error o éxito
function cerrar(id) {
    document.getElementById(id).hidden = true;
}

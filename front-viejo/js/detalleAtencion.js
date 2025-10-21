document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://localhost:7186/api/Veterinaria'; 
    // Obtener los elementos del formulario
    const form = document.getElementById('form-orden');
    const inputFecha = document.getElementById('input-fecha');
    const inputModelo = document.getElementById('input-modelo');
    const inputCantidad = document.getElementById('input-cantidad');
    const selectComponentes = document.getElementById('component');

    // Agregar un listener al formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Formulario enviado'); 

        // Obtener los valores del formulario
        const fechaInput = new Date(inputFecha.value);  
        const fecha = fechaInput.toISOString(); 

        const modelo = inputModelo.value;
        const cantidad = parseInt(inputCantidad.value);

        // Recorrer la tabla de componentes
        const detalles = obtenerDetallesTabla();

        
        const body = {
            fecha: fecha,
            listaDetalles: detalles,
            modelo: modelo,
            estado: 'Creada',
            cantidad: cantidad
        };

        try {
            const response = await fetch(`${API_URL}/OrdenProduccion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                alert('Orden de producción agregada con éxito');
               
                form.reset();
            } else {
                alert('Error al agregar la orden de producción');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Ocurrió un error al intentar agregar la orden de producción');
        }
    });

    // Cargar componentes en el select
    cargarComponentes();

    // Cargar componentes en el select
    async function cargarComponentes() {
        try {
            const response = await fetch(`${API_URL}/Componente`);
            if (!response.ok) throw new Error('Error al cargar componentes');

            const componentes = await response.json();
            componentes.forEach(componente => {
                const option = document.createElement('option');
                option.value = componente.codigo; // Código como valor
                option.textContent = componente.nombre; // Nombre como texto
                selectComponentes.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar componentes:', error);
            alert('Ocurrió un error al cargar los componentes');
        }
    }


    // Función para recorrer la tabla y obtener los detalles de la orden
    function obtenerDetallesTabla() {
        const tabla = document.getElementById('detailsTable');
        const filas = tabla.querySelectorAll('tbody tr');
        const detalles = [];

        filas.forEach(fila => {
            const id = parseInt(fila.children[0].textContent);  // Primer columna: ID
            const componente = fila.children[1].textContent;    // Segunda columna: Componente
            const cantidad = parseInt(fila.children[2].textContent);  // Tercera columna: Cantidad

            detalles.push({
                id: id,
                componente: {
                    codigo: id, 
                    nombre: componente,
                    fechaBaja: null, 
                    motivoBaja: null 
                },
                cantidad: cantidad
            });
        });

        return detalles;
    }
});



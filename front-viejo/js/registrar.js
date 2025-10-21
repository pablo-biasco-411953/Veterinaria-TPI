document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://localhost:7186/api'; // Reemplaza con tu URL real

    // Obtener los elementos del formulario
    const form = document.getElementById('form-registrar');
    const inputNombre = document.getElementById('nombre');
    const inputApellido = document.getElementById('apellido');
    const inputDni = document.getElementById('dni');
    const inputTelefono = document.getElementById('telefono');
    const inputUsername = document.getElementById('dni');
    const inputPassword = document.getElementById('contrasena');
    const inputRepitPassword = document.getElementById('repetir-contrasena');
    const submitButton = document.getElementById('submit-button');


    validateForm(); // Llamamos al metodo que valida el formulario


    // Agregar un listener a cada campo, y que cuando haya un cambio, se valide
    inputNombre.addEventListener("input", () => {
        validateInput('nombre', 'El nombre es obligatorio!');
    });

    inputApellido.addEventListener("input", () => {
        validateInput('apellido', 'El apellido es obligatorio!');
    });

    inputDni.addEventListener("input", () => {
        validateInput("dni", 'El DNI es obligatorio!');
    });
    
    inputTelefono.addEventListener("input", () => {
        validateInput("telefono", 'El teléfono es obligatorio!');
    });
    
    inputPassword.addEventListener("input", () => {
        validateInput("contrasena", 'La contraseña es obligatoria!');
    });
    
    inputRepitPassword.addEventListener("input", () => {
        validateInput("repetir-contrasena", 'La contraseña de repetición es obligatoria!');
        validatePasswords();
    });


    // Agregar un listener al formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nombre = inputNombre.value;
        const apellido = inputApellido.value;
        const dni = inputDni.value;
        const telefono = inputTelefono.value;
        const username = inputUsername.value;
        const password = inputPassword.value;

        const body = {
            nombre: nombre,
            apellido: apellido,
            dni: dni,
            telefono: telefono,
            username: username,
            password: password
        }; 

        try {
            const response = await fetch(`${API_URL}/User`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                Swal.fire({
                    position: "center-center",
                    icon: "success",
                    title: "Usuario registrado con éxito!",
                    showConfirmButton: false,
                    timer: 1500
                  });

                  form.reset();

                // Redirigir a home / login / o directamente iniciar la sesion ya que se creo el usuario
            } else {
                Swal.fire({
                    position: "center-center",
                    icon: "warning",
                    title: "El usuario no se pudo registrar!",
                    showConfirmButton: false,
                    timer: 1500
                  });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                position: "center-center",
                icon: "warning",
                title: "El usuario no se pudo registrar!",
                showConfirmButton: false,
                timer: 1500
              });
        }
    });

    // Validar que las contraseñas sean iguales
    function validatePasswords() {
        const inputElement = document.getElementById("repetir-contrasena");
        const inputPassword = document.getElementById("contrasena");
        let errorMessage = document.getElementById(`error-repetir-contrasena`);
        
        // Verificar si las contraseñas no coinciden
        if (inputPassword.value !== inputElement.value) {
            // Si el mensaje de error no existe, crear el mensaje
            if (!errorMessage) {
                errorMessage = document.createElement('span');
                errorMessage.id = 'error-repetir-contrasena';
                errorMessage.style.color = 'red';
                errorMessage.innerText = 'Las contraseñas no coinciden!';
                
                // Agregar el mensaje de error debajo del campo de repetición de contraseña
                inputElement.parentElement.appendChild(errorMessage);
            }
        } else {
            // Si las contraseñas coinciden, eliminar el mensaje de error si existe
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    }
    

    
    // Habilita o deshabilita el botón de registrar
    function validateForm() {
        
        const inputs = [inputNombre, inputApellido, inputDni, inputTelefono, inputUsername, inputPassword, inputRepitPassword];
        
        // Verificar si todos los campos tienen contenido
        const isFormValid = inputs.every(input => input.value.trim() !== '');
    
        // Habilitar o deshabilitar el botón de envío
        submitButton.disabled = !isFormValid;
    }
    
    // Validar un campo de entrada
    function validateInput(inputId, errorMessageText) {
        // Obtener el campo de entrada y el mensaje de error
        const inputElement = document.getElementById(inputId);
        let errorMessage = document.getElementById(`error-${inputId}`);
        
        // Si el campo está vacío y el mensaje de error no existe, crear el mensaje
        if (inputElement.value.length === 0) {
            if (!errorMessage) { // Verificar que no se haya agregado el mensaje antes
                errorMessage = document.createElement('span');
                errorMessage.id = `error-${inputId}`;
                errorMessage.style.color = 'red';
                errorMessage.innerText = errorMessageText;
                
                // Agregar el mensaje de error debajo del campo de entrada
                inputElement.parentElement.appendChild(errorMessage);
            }
        } else {
            // Si el campo tiene contenido, eliminar el mensaje de error si existe
            if (errorMessage) {
                errorMessage.remove();
            }
        }
        // Validar el formulario después de que se haya completado un campo
        validateForm(); 
    }
});





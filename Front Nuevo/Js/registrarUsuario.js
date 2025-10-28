import { registerUser } from './api.js';

const SWAL_THEME = {
    background: '#1a202c',
    color: '#BFD4EA',
    confirmButtonColor: '#3498db',
    customClass: { title: 'text-info' }
};

// ===== Función de alertas globales =====
function showAlert(message, isSuccess = false) {
    Swal.fire({
        icon: isSuccess ? 'success' : 'error',
        title: isSuccess ? '¡Éxito!' : 'Error',
        text: message,
        background: SWAL_THEME.background,
        color: SWAL_THEME.color,
        timerProgressBar: true,
        confirmButtonColor: SWAL_THEME.confirmButtonColor,
        customClass: SWAL_THEME.customClass
    });
}

// ===== Validación de cada campo =====
function validateField(name, value = '', compareValue = '') {
    value = value.trim();
    compareValue = compareValue.trim();

    switch (name) {
        case 'nombre':
            if (value.length < 2) return 'El nombre debe tener al menos 2 letras.';
            if (/\d/.test(value)) return 'El nombre no puede contener números.';
            if (value.length > 50) return 'El nombre es demasiado largo.';
            break;

        case 'apellido':
            if (value.length < 2) return 'El apellido debe tener al menos 2 letras.';
            if (/\d/.test(value)) return 'El apellido no puede contener números.';
            if (value.length > 50) return 'El apellido es demasiado largo.';
            break;

        case 'matricula':
            if (!value.startsWith('MP-')) return 'La matrícula debe comenzar con "MP-".';
            const numeroMatricula = value.replace('MP-', '');
            if (numeroMatricula.length < 3 || isNaN(numeroMatricula)) return 'La matrícula debe tener al menos 3 números después de "MP-".';
            break;

        case 'email':
            if (!value.includes('@') || !value.includes('.')) return 'El email debe tener un formato válido (ejemplo@correo.com).';
            if (value.length < 5) return 'El email es demasiado corto.';
            break;

        case 'password':
            if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
            if (!/[A-Z]/.test(value)) return 'La contraseña debe incluir al menos una letra mayúscula.';
            if (!/[!@#$%^&*()_\-+=]/.test(value)) return 'La contraseña debe incluir al menos un carácter especial (!@#$%^&*).';
            break;

        case 'passwordConfirm':
            if (value !== compareValue) return 'Las contraseñas no coinciden.';
            break;
    }

    return ''; // Sin errores
}

(function () {
    const form = document.getElementById('registroForm');
    if (!form) return;

    const fields = ['nombre', 'apellido', 'matricula', 'email', 'password', 'passwordConfirm'];

    // ===== Prefijo automático para matrícula =====
    const inputMatricula = form.elements['matricula'];
    if (inputMatricula) {
        inputMatricula.value = 'MP-';
        inputMatricula.addEventListener('input', (e) => {
            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
            if (!value.startsWith('MP-')) value = 'MP-' + value.replace('MP-', '');
            e.target.value = value.substring(0, 10);
        });
    }

    // ===== Validación en vivo al perder foco =====
    fields.forEach(name => {
        const input = form.elements[name];
        if (!input) return;

        // Crear span para mensajes de error si no existe
        let errorSpan = input.nextElementSibling;
        if (!errorSpan || !errorSpan.classList.contains('invalid-feedback')) {
            errorSpan = document.createElement('div');
            errorSpan.classList.add('invalid-feedback');
            input.parentNode.appendChild(errorSpan);
        }

        input.addEventListener('blur', () => {
            const compareValue = name === 'passwordConfirm' ? form.elements['password'].value : '';
            const error = validateField(name, input.value, compareValue);

            if (error) {
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
                errorSpan.textContent = error;
                errorSpan.style.display = 'block';
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
                errorSpan.textContent = '';
                errorSpan.style.display = 'none';
            }
        });

        // Borrar error al escribir
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
            input.classList.remove('is-valid');
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
        });
    });

    // ===== Envío del formulario =====
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.textContent = 'Registrando...';
        btnSubmit.disabled = true;

        const userData = {
            nombre: form.elements['nombre'].value.trim(),
            apellido: form.elements['apellido'].value.trim(),
            matricula: form.elements['matricula'].value.trim(),
            email: form.elements['email'].value.trim(),
            password: form.elements['password'].value,
            passwordConfirm: form.elements['passwordConfirm'].value
        };

        // Validación final antes de enviar
        for (const field of fields) {
            const compareValue = field === 'passwordConfirm' ? userData.password : '';
            const error = validateField(field, userData[field], compareValue);
            const input = form.elements[field];
            const errorSpan = input.nextElementSibling;

            if (error) {
                input.classList.add('is-invalid');
                if (errorSpan) {
                    errorSpan.textContent = error;
                    errorSpan.style.display = 'block';
                }
                btnSubmit.textContent = 'Registrar';
                btnSubmit.disabled = false;
                input.focus();
                return;
            } else {
                input.classList.remove('is-invalid');
                if (errorSpan) {
                    errorSpan.textContent = '';
                    errorSpan.style.display = 'none';
                }
            }
        }

        // ===== Enviar a API =====
        try {
            const response = await registerUser(userData);
            const data = await response.json(); 
            console.log("la dataa",data)
              if (response.status === 200) {
        Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            timerProgressBar: true,
            customClass: { title: 'swal2-title-custom' },
            text: data?.Message || 'Tu cuenta fue creada correctamente. Redireccionando al login...',
        });
        setTimeout(() => (window.location.href = './index.html'), 4000);

    } else if (response.status === 409) {
        showAlert(data?.Message || 'El email ya está registrado.');

    } else {
        // Mostrar mensaje detallado si el backend lo envía
        const errorMsg = data?.detail 
            ? `Error al registrar: ${data.detail}` 
            : (data?.Message || 'Error al registrar.');
        showAlert(errorMsg, false);
    }

} catch (err) {
    showAlert('Error de conexión con el servidor.', false);

} finally {
    btnSubmit.textContent = 'Registrar';
    btnSubmit.disabled = false;
}
    });

})();

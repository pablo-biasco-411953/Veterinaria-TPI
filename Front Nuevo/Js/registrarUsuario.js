import { registerUser, loginUser } from './api.js';

const SWAL_THEME = {
    background: '#1a202c',
    color: '#BFD4EA',
    confirmButtonColor: '#3498db',
    customClass: { title: 'text-info' }
};

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
            const numeroMatricula = value.replace(/^MP-/, '');
            if (!/^\d*$/.test(numeroMatricula)) return 'La matrícula solo puede contener números después de MP-.';
            break;
        case 'email':
            if (!value.includes('@') || !value.includes('.')) return 'El email debe tener un formato valido (ejemplo@correo.com).';
            if (value.length < 5) return 'El email es demasiado corto.';
            break;
        case 'password':
            if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
            if (!/[A-Z]/.test(value)) return 'La contraseña debe incluir al menos una letra mayúscula.';
            if (!/[a-z]/.test(value)) return 'La contraseña debe incluir al menos una letra minúscula.';
            if (!/[0-9]/.test(value)) return 'La contraseña debe incluir al menos un número.';
            if (!/[!@#$%^&*()_\-+=]/.test(value)) return 'La contraseña debe incluir al menos un caracter especial (!@#$%^&*).';
            break;
        case 'passwordConfirm':
            if (value !== compareValue) return 'Las contraseñas no coinciden.';
            break;
    }
    return '';
}

(function () {
    const form = document.getElementById('registroForm');
    if (!form) return;

    const fields = ['nombre', 'apellido', 'matricula', 'email', 'password', 'passwordConfirm'];

    form.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🙈';
            } else {
                input.type = 'password';
                btn.textContent = '🙉';
            }
        });
    });

    const passwordInput = form.elements['password'];
    const passwordTips = document.createElement('div');
    passwordTips.id = 'passwordTips';
    passwordInput.parentNode.parentNode.appendChild(passwordTips);

    passwordInput.addEventListener('input', () => {
        const value = passwordInput.value;
        const tips = [
            { text: 'Al menos 8 caracteres', valid: value.length >= 8 },
            { text: 'Al menos una mayúscula', valid: /[A-Z]/.test(value) },
            { text: 'Al menos un número', valid: /[0-9]/.test(value) },
            { text: 'Al menos un símbolo (!@#$%^&*)', valid: /[!@#$%^&*()_\-+=]/.test(value) },
        ];

        passwordTips.innerHTML = tips.map(tip => 
            `<div style="color:${tip.valid ? '#38c172' : '#ff6b6b'}">${tip.text}</div>`
        ).join('');
    });

    const matriculaInput = form.elements['matricula'];
    matriculaInput.addEventListener('input', () => {
        let val = matriculaInput.value.replace(/\D/g, ''); // solo números
        if (val.length > 0) {
            matriculaInput.value = 'MP-' + val;
        } else {
            matriculaInput.value = '';
        }
    });

    fields.forEach(name => {
        const input = form.elements[name];
        if (!input) return;

        if (!['password', 'passwordConfirm'].includes(name)) {
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

            input.addEventListener('input', () => {
                input.classList.remove('is-invalid');
                input.classList.remove('is-valid');
                errorSpan.textContent = '';
                errorSpan.style.display = 'none';
            });
        }
    });

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

        for (const field of fields) {
            const compareValue = field === 'passwordConfirm' ? userData.password : '';
            const error = validateField(field, userData[field], compareValue);

            if (error && !['password', 'passwordConfirm'].includes(field)) {
                const input = form.elements[field];
                const errorSpan = input.nextElementSibling;
                input.classList.add('is-invalid');
                if (errorSpan) {
                    errorSpan.textContent = error;
                    errorSpan.style.display = 'block';
                }
                btnSubmit.textContent = 'Registrar';
                btnSubmit.disabled = false;
                input.focus();
                return;
            }
        }

        try {
            const response = await registerUser(userData);
            const data = await response.json();

            if (response.ok) {
                const loginRes = await loginUser({ username: userData.email, password: userData.password });
                const loginData = await loginRes.json();

                if (loginRes.ok && loginData.token) {
                    sessionStorage.setItem('dogtorUser', JSON.stringify({
                        id: loginData.user.id,
                        nombre: loginData.user.nombre,
                        apellido: loginData.user.apellido,
                        matricula: loginData.user.matricula,
                        email: loginData.user.email,
                        token: loginData.token
                    }));
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro y login exitoso!',
                        text: 'Redirigiendo al dashboard...',
                        timer: 2500,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                    setTimeout(() => window.location.href = './inicio.html', 2500);
                } else {
                    showAlert('Registro exitoso, pero fallo el login automatico.', false);
                    setTimeout(() => window.location.href = './index.html', 2500);
                }
            } else if (response.status === 409) {
                showAlert(data?.Message || 'El email ya esta registrado.');
            } else {
                const errorMsg = data?.detail ? `Error al registrar: ${data.detail}` : (data?.Message || 'Error al registrar.');
                showAlert(errorMsg, false);
            }
        } catch (err) {
            showAlert('Error de conexion con el servidor.', false);
        } finally {
            btnSubmit.textContent = 'Registrar';
            btnSubmit.disabled = false;
        }
    });
})();

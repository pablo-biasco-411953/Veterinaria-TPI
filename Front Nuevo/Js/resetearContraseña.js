import { resetPassword, loginUser } from './api.js'; // funciones que agregamos en api.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const message = document.getElementById('message');
    const tipsContainer = document.getElementById('passwordTips');

    // 1. Tips de contraseña en vivo
    const tips = {
        length: createTip('* Al menos 8 caracteres'),
        upper: createTip('* Una mayúscula'),
        number: createTip('* Un número'),
        symbol: createTip('* Un símbolo especial')
    };
    Object.values(tips).forEach(t => tipsContainer.appendChild(t));

    function createTip(text) {
        const div = document.createElement('div');
        div.textContent = text;
        div.style.color = 'red';
        div.style.fontSize = '0.9em';
        div.style.transition = 'color 0.2s';
        return div;
    }

    const regexes = {
        upper: /[A-Z]/,
        number: /[0-9]/,
        symbol: /[!@#$%^&*(),.?":{}|<>]/
    };

    function validarPasswordLive(password) {
        tips.length.style.color = password.length >= 8 ? '#00ff90' : 'red';
        tips.upper.style.color = regexes.upper.test(password) ? '#00ff90' : 'red';
        tips.number.style.color = regexes.number.test(password) ? '#00ff90' : 'red';
        tips.symbol.style.color = regexes.symbol.test(password) ? '#00ff90' : 'red';
    }

    newPasswordInput.addEventListener('input', (e) => {
        validarPasswordLive(e.target.value);
    });

    newPasswordInput.addEventListener('focus', () => {
        Object.values(tips).forEach(tip => {
            if (!tip.style.color.includes('90')) tip.style.color = '#00dfff'; // azul neon
        });
    });

    newPasswordInput.addEventListener('blur', () => {
        validarPasswordLive(newPasswordInput.value);
    });

    // 2. Toggle visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            input.type = input.type === 'password' ? 'text' : 'password';
            btn.textContent = input.type === 'password' ? '🙉' : '🙈';
        });
    });

    // 3. Validacion para submit
    function validarPassword(password) {
        const minLength = 8;
        if (password.length < minLength) return 'La contraseña debe tener al menos 8 caracteres.';
        if (!regexes.upper.test(password)) return 'La contraseña debe contener al menos una letra mayúscula.';
        if (!regexes.number.test(password)) return 'La contraseña debe contener al menos un número.';
        if (!regexes.symbol.test(password)) return 'La contraseña debe contener al menos un símbolo (!@#$%^&* etc.).';
        return null;
    }

    // 4. Submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        message.textContent = '';
        message.style.color = 'red';

        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!newPassword || !confirmPassword) {
            message.textContent = 'Por favor, completa todos los campos.';
            return;
        }

        if (newPassword !== confirmPassword) {
            message.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        const validationError = validarPassword(newPassword);
        if (validationError) {
            message.textContent = validationError;
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
            message.textContent = 'Token no valido.';
            return;
        }

        try {
            // Llamada al endpoint de reset
            const res = await resetPassword(token, newPassword); 
            const data = await res.json();

            if (res.ok) {
                message.style.color = 'green';
                message.textContent = '¡Contraseña restablecida correctamente!';

                Swal.fire({
                    icon: 'success',
                    title: 'Listo',
                    text: 'Tu contraseña ha sido actualizada.',
                    confirmButtonColor: '#00BFFF'
                }).then(async () => {
                    try {
                        const loginRes = await loginUser({ email: data.email, password: newPassword });
                        const loginData = await loginRes.json();
                        localStorage.setItem('token', loginData.token);
                        window.location.href = './index.html';
                    } catch (err) {
                        console.error('Login automatico fallido', err);
                    }
                });

            } else {
                message.textContent = data.Message || 'Error al restablecer contraseña.';
                Swal.fire({
                    icon: 'error',
                    title: 'Ups...',
                    text: data.Message || 'Error al restablecer contraseña.',
                    confirmButtonColor: '#00BFFF'
                });
            }
        } catch (err) {
            message.textContent = 'Error en la conexion con el servidor.';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo conectar con el servidor.',
                confirmButtonColor: '#00BFFF'
            });
        }
    });
});

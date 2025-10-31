import { resetPassword, loginUser } from './api.js'; // funciones que agregamos en api.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const message = document.getElementById('message');

    // Toggle password
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🙈';
            } else {
                input.type = 'password';
                btn.textContent = '👁️';
            }
        });
    });

    // Submit form
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

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
            message.textContent = 'Token no válido.';
            return;
        }

        try {
            // Llamada al endpoint de reset
                const res = await resetPassword(token, newPassword); // enviás token y nuevaContraseña
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
                    // Auto login usando la función de api.js
                    try {
                        const loginRes = await loginUser({ email: data.email, password: newPassword });
                        const loginData = await loginRes.json();
                        localStorage.setItem('token', loginData.token);
                        window.location.href = './index.html';
                    } catch (err) {
                        console.error('Login automático fallido', err);
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
            message.textContent = 'Error en la conexión con el servidor.';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo conectar con el servidor.',
                confirmButtonColor: '#00BFFF'
            });
        }
    });
});

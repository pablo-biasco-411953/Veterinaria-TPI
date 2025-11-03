import { forgotPassword } from './api.js'; // tu api.js con la funcion que agregamos

document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('emailForgot').value.trim();
    const message = document.getElementById('message');

    message.textContent = '';
    message.style.color = 'red';

    if (!email) {
        message.textContent = 'Por favor, ingresa tu email.';
        return;
    }

    try {
        // Llamamos al endpoint usando la funcion de api.js
        const res = await forgotPassword(email);
        const data = await res.json();

        if (res.ok) {
            message.style.color = 'green';
            message.textContent = '¡Enlace enviado correctamente! Revisa tu email.';

            Swal.fire({
                icon: 'success',
                title: 'Listo',
                text: 'Revisa tu bandeja de entrada.',
                confirmButtonColor: '#00BFFF'
            });

        } else {
            message.textContent = data.Message || 'Error al enviar el enlace.';
            Swal.fire({
                icon: 'error',
                title: 'Ups...',
                text: data.Message || 'Error al enviar el enlace.',
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

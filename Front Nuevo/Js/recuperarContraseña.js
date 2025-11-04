import { forgotPassword } from './api.js';

function showLoader() {
    let overlay = document.getElementById('loading-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        
        overlay.innerHTML = `
            <img src="../Assets/logo2.png" alt="Dogtor Logo" class="loader-logo">
            <div class="loader-container">
                <div class="loader-bar"></div>
            </div>
            <div class="loading-text">Cargando...</div>
        `;
        document.body.appendChild(overlay);
    }
    
    requestAnimationFrame(() => {
        overlay.classList.add('visible');
    });
}

function hideLoader() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
    }
}

document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('emailForgot').value.trim();
    const message = document.getElementById('message');
    
    const submitButton = e.target.querySelector('button[type="submit"]');

    message.textContent = '';
    message.style.color = 'red';

    if (!email) {
        message.textContent = 'Por favor, ingresa tu email.';
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    showLoader();

    try {
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
        message.textContent = 'Error en la conexión con el servidor.';
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo conectar con el servidor.',
            confirmButtonColor: '#00BFFF'
        });
    } finally {
        hideLoader();
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar enlace';
    }
});
import { forgotPassword } from './api.js';

// ===== FUNCIONES DE LOADING =====
// Las copiamos aquí para que este script las pueda usar

/**
 * Muestra el overlay de carga con el logo y el efecto de escaneo.
 */
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

/**
 * Oculta el overlay de carga con una transición suave.
 */
function hideLoader() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
    }
}
// ==================================


document.getElementById('forgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('emailForgot').value.trim();
    const message = document.getElementById('message');
    
    // Capturamos el botón para deshabilitarlo
    const submitButton = e.target.querySelector('button[type="submit"]');

    message.textContent = '';
    message.style.color = 'red';

    if (!email) {
        message.textContent = 'Por favor, ingresa tu email.';
        return;
    }

    // 1. Deshabilitamos el botón y mostramos el loader
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    showLoader();

    try {
        // 2. Llamamos al endpoint
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
        // 3. (IMPORTANTE) Ocultamos el loader y rehabilitamos el botón
        //    (esto se ejecuta SIEMPRE, con éxito o error)
        hideLoader();
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar enlace';
    }
});
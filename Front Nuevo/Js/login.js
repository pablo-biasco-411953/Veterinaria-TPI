import { loginUser } from './api.js';

const SWAL_THEME = {
    background: '#1a202c',
    color: '#BFD4EA',
    confirmButtonColor: '#3498db',
    customClass: { title: 'text-info' }
};

(function () {
    // --- Si ya hay sesión activa ---
    const existingUser = sessionStorage.getItem('dogtorUser');
    const existingToken = localStorage.getItem('token');

    if (existingUser && existingToken) {
        window.location.href = './inicio.html';
        return;
    }

    const form = document.getElementById('loginForm');
    if (!form) return;

    // === Mostrar/ocultar contraseña ===
    const passwordField = form.querySelector('input[name="password"]');
    const toggleBtn = form.querySelector('.toggle-password');

    if (passwordField && toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = passwordField.type === 'password';
            passwordField.type = isHidden ? 'text' : 'password';
            toggleBtn.textContent = isHidden ? '🙈' : '🙉';
        });
    }

    // === Login ===
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = form.elements['email']?.value?.trim();
        const password = form.elements['password']?.value ?? '';

        if (!email || !password) {
            Swal.fire({
                title: 'Datos inválidos',
                text: 'Ingresa el email y la contraseña.',
                icon: 'error',
                ...SWAL_THEME
            });
            return;
        }

        try {
            const response = await loginUser({ username: email, password });

            if (response.ok) {
                const data = await response.json();
                const user = data.user;

                // Guardar sesión
                sessionStorage.setItem('dogtorUser', JSON.stringify({
                    id: user.id,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    matricula: user.matricula,
                    email: user.email,
                    token: data.token,
                    isAdmin: user.isAdmin 
                }));

                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', email);

                window.location.href = './inicio.html';
            } else if (response.status === 401) {
                Swal.fire({
                    title: 'Acceso denegado',
                    text: 'Usuario o contraseña incorrectos.',
                    icon: 'error',
                    ...SWAL_THEME
                });
            } else {
                const err = await response.json();
                Swal.fire({
                    title: 'Error',
                    text: err?.Message || 'Error al iniciar sesión.',
                    icon: 'error',
                    ...SWAL_THEME
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor.',
                icon: 'error',
                ...SWAL_THEME
            });
        }
    });
})();

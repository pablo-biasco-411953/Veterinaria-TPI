// js/login.js
import { loginUser } from './api.js';

const SWAL_THEME = {
    background: '#1a202c',
    color: '#BFD4EA',
    confirmButtonColor: '#3498db',
    customClass: { title: 'text-info' }
};

(function () {
    // ✅ 1. VERIFICAR SI YA HAY SESIÓN ACTIVA
    const existingUser = sessionStorage.getItem('dogtorUser');
    const existingToken = localStorage.getItem('token');

    if (existingUser && existingToken) {
        // Podés validar si el token sigue vigente si querés hacer una petición al backend
        console.log('Sesión activa detectada, redirigiendo...');
        window.location.href = './dashboard.html';
        return; // Detiene el script aquí
    }

    // ✅ 2. SI NO HAY SESIÓN, CONTINÚA CON EL LOGIN NORMAL
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = form.elements['email']?.value?.trim();
        const password = form.elements['password']?.value ?? '';

        if (!email || !password) {
            Swal.fire({
                title: 'Datos inválidos!',
                text: 'Ingresá el email y la contraseña',
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

                // ✅ Guardar sesión
                sessionStorage.setItem('dogtorUser', JSON.stringify({
                    id: user.id,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    matricula: user.matricula,
                    email: user.email,
                    token: data.token
                }));

                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', email);

                // Redirigir al dashboard
                window.location.href = './dashboard.html';
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
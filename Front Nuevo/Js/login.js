// js/login.js
import { loginUser } from './api.js';

const SWAL_THEME = {
    background: '#1a202c',
    color: '#BFD4EA',
    confirmButtonColor: '#3498db',
    customClass: { title: 'text-info' }
};

(function () {
    // VERIFICAR SI YA HAY SESIoN ACTIVA
    const existingUser = sessionStorage.getItem('dogtorUser');
    const existingToken = localStorage.getItem('token');

    if (existingUser && existingToken) {
        console.log('Sesion activa detectada, redirigiendo...');
        window.location.href = './inicio.html';
        return; 
    }

    // Si no hay sesion me voy al login normall
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = form.elements['email']?.value?.trim();
        const password = form.elements['password']?.value ?? '';

        if (!email || !password) {
            Swal.fire({
                title: 'Datos invalidos!',
                text: 'Ingresa el email y la contraseña',
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

                //  Guardar sesion
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
                    text: err?.Message || 'Error al iniciar sesion.',
                    icon: 'error',
                    ...SWAL_THEME
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error de conexion',
                text: 'No se pudo conectar con el servidor.',
                icon: 'error',
                ...SWAL_THEME
            });
        }
    });
})();
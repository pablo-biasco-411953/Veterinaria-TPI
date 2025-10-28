// js/login.js
import { loginUser } from './api.js';
const SWAL_THEME = {
    background: '#1a202c', 
    color: '#BFD4EA', 
    confirmButtonColor: '#3498db',
    customClass: { title: 'text-info' } 
};
(function () {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. OBTENEMOS LAS CREDENCIALES
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
            // 2. LLAMADA A LA API
            const response = await loginUser({ username: email, password }); 
            if (response.ok) {
                const data = await response.json();

                const user = data.user; 

                // 3. ALMACENAMIENTO DE SESIÓN
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

                window.location.href = './dashboard.html';
            } else if (response.status === 401) {
                alert('Usuario o contraseña incorrectos.');
            } else {
                const err = await response.json();
                alert(err?.Message || 'Error al iniciar sesión.');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión con el servidor.');
        }
    });
})();
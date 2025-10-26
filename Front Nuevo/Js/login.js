// js/login.js
import { loginUser } from './api.js';

(function () {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dni = form.elements['email']?.value?.trim(); 
        const password = form.elements['password']?.value ?? '';

        if (!dni || !password) {
            alert('Completá DNI y contraseña.');
            return;
        }

        try {
            const response = await loginUser({ username: dni, password });
            console.log("La res",response)
            if (response.ok) {
            const data = await response.json();
            console.log("LA ATAAA: ", data)

            const user = data.user; // <-- aquí está tu usuario

            sessionStorage.setItem('dogtorUser', JSON.stringify({
                id: user.id,          
                nombre: user.nombre,
                apellido: user.apellido,
                dni: user.dni,
                token: data.token // token sigue en la raíz
            }));

            localStorage.setItem('token', data.token);
            localStorage.setItem('userDni', dni);

            window.location.href = './dashboard.html';
            }else if (response.status === 401) {
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

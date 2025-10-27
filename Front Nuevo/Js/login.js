// js/login.js
import { loginUser } from './api.js';

(function () {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. OBTENEMOS LAS CREDENCIALES
        // El input se llama 'email' y ahora lo usamos como 'username' para el login (email del veterinario).
        const email = form.elements['email']?.value?.trim(); 
        const password = form.elements['password']?.value ?? '';

        if (!email || !password) {
            alert('Completá email y contraseña.');
            return;
        }

        try {
            // 2. LLAMADA A LA API
            // El 'username' para la API ahora es el email
            const response = await loginUser({ username: email, password }); 
            console.log("La res",response)
            
            if (response.ok) {
                const data = await response.json();
                console.log("LA ATAAA: ", data)

                const user = data.user; // <-- Ahora este es el DtoVeterinario

                // 3. ALMACENAMIENTO DE SESIÓN (Actualizado para Veterinario)
                sessionStorage.setItem('dogtorUser', JSON.stringify({
                    id: user.id, // codVeterinario
                    nombre: user.nombre,
                    apellido: user.apellido,
                    matricula: user.matricula, // 💡 CAMBIADO: DNI por MATRICULA
                    email: user.email,         // 💡 AGREGADO: Email
                    token: data.token 
                }));

                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', email); // 💡 CAMBIADO: userDni por userEmail

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
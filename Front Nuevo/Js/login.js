// js/login.js
(function () {
    const form = document.getElementById('loginForm');
    if (!form) return;

    //Credenciales de prueba
    const TEST_USER = {
        email: 'demo@dogtor.com',
        pass: '1234'
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = form.elements['email']?.value?.trim();
        const pass = form.elements['password']?.value ?? '';

        // Validación básica
        if (!email || !pass) {
            alert('Completá email y contraseña.');
            return;
        }

        // Verifica credenciales
        const ok = email.toLowerCase() === TEST_USER.email.toLowerCase() && pass === TEST_USER.pass;

        if (ok) {
            // Guarda sesión temporal
            sessionStorage.setItem('dogtorUser', JSON.stringify({ email }));


            window.location.href = './dashboard.html';
        } else {
            alert('Credenciales inválidas (demo). Usá demo@dogtor.com / 1234');
        }
    });
})();

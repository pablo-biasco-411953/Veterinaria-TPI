import { validarCampoVacio, validarContrasenas, actualizarBoton, validarTexto, validarNumero } from './validaciones.js';
import { registerUser } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const boton = document.getElementById('submit-button');
    const form = document.getElementById('form-registrar');

    const campos = [
        document.getElementById('nombre'),
        document.getElementById('apellido'),
        document.getElementById('dni'),
        document.getElementById('codigo-area'),
        document.getElementById('telefono'),
        document.getElementById('contrasena'),
        document.getElementById('repetir-contrasena')
    ];

    campos.forEach(campo => {
        if (!campo) return;
        campo.addEventListener('input', () => {
            switch (campo.id) {
                case 'nombre':
                case 'apellido':
                    validarTexto(campo);
                    break;
                case 'dni':
                    validarNumero(campo, 'DNI inválido', 7, 8);
                    break;
                case 'codigo-area':
                    validarNumero(campo, 'Código de área inválido', 2, 4);
                    break;
                case 'telefono':
                    validarNumero(campo, 'Teléfono inválido', 6, 8);
                    break;
                case 'contrasena':
                case 'repetir-contrasena':
                    validarContrasenas(document.getElementById('contrasena'), document.getElementById('repetir-contrasena'));
                    break;
            }
            actualizarBoton(boton, campos);
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let valido = true;
        valido &= validarTexto(document.getElementById('nombre'));
        valido &= validarTexto(document.getElementById('apellido'));
        valido &= validarNumero(document.getElementById('dni'), 'DNI inválido', 7, 8);
        valido &= validarNumero(document.getElementById('codigo-area'), 'Código de área inválido', 2, 4);
        valido &= validarNumero(document.getElementById('telefono'), 'Teléfono inválido', 6, 8);
        valido &= validarContrasenas(document.getElementById('contrasena'), document.getElementById('repetir-contrasena'));

        if (!valido) return;

        const userData = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            dni: document.getElementById('dni').value,
            codigoArea: document.getElementById('codigo-area').value,
            telefono: document.getElementById('telefono').value,
            username: document.getElementById('dni').value,
            password: document.getElementById('contrasena').value
        };

        try {
            const response = await registerUser(userData);
            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Usuario registrado!', showConfirmButton: false, timer: 1500 });
                form.reset();
                actualizarBoton(boton, campos);
            } else {
                const errorData = await response.json();
                Swal.fire({ icon: 'error', title: 'Error al registrar', text: errorData.message || 'No se pudo registrar el usuario' });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor' });
        }
    });
});

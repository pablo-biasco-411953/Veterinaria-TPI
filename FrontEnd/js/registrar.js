import { validarCampoVacio, validarContrasenas, actualizarBoton, validarNumero } from './validaciones.js';

document.addEventListener('DOMContentLoaded', () => {
    const boton = document.getElementById('submit-button');
    const campos = [
        document.getElementById('nombre'),
        document.getElementById('apellido'),
        document.getElementById('dni'),
        document.getElementById('telefono'),
        document.getElementById('contrasena'),
        document.getElementById('repetir-contrasena')
    ];

    campos.forEach(campo => {
        campo.addEventListener('input', () => {
            validarCampoVacio(campo, `${campo.placeholder} es obligatorio`);
            if (campo.id === 'dni' || campo.id === 'telefono') validarNumero(campo, `${campo.placeholder} debe ser un número`);
            if (campo.id === 'repetir-contrasena') validarContrasenas(
                document.getElementById('contrasena'),
                document.getElementById('repetir-contrasena')
            );
            actualizarBoton(boton, campos);
        });
    });
});

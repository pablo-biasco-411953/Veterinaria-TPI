// validaciones.js

/**
 * Valida si un campo está vacío y muestra un mensaje de error
 * @param {HTMLElement} campo - El input a validar
 * @param {string} mensaje - Mensaje a mostrar si está vacío
 */
export function validarCampoVacio(campo, mensaje) {
    let mensajeError = document.getElementById(`error-${campo.id}`);

    if (campo.value.trim() === '') {
        if (!mensajeError) {
            mensajeError = document.createElement('span');
            mensajeError.id = `error-${campo.id}`;
            mensajeError.style.color = 'red';
            mensajeError.innerText = mensaje;
            campo.parentElement.appendChild(mensajeError);
        }
    } else if (mensajeError) {
        mensajeError.remove();
    }
}

/**
 * Valida que las contraseñas coincidan
 * @param {HTMLInputElement} contrasena
 * @param {HTMLInputElement} repetirContrasena
 */
export function validarContrasenas(contrasena, repetirContrasena) {
    let mensajeError = document.getElementById(`error-${repetirContrasena.id}`);

    if (contrasena.value !== repetirContrasena.value) {
        if (!mensajeError) {
            mensajeError = document.createElement('span');
            mensajeError.id = `error-${repetirContrasena.id}`;
            mensajeError.style.color = 'red';
            mensajeError.innerText = 'Las contraseñas no coinciden';
            repetirContrasena.parentElement.appendChild(mensajeError);
        }
    } else if (mensajeError) {
        mensajeError.remove();
    }
}

/**
 * Comprueba si todos los campos tienen contenido
 * @param {Array<HTMLInputElement>} campos
 * @returns {boolean} true si todos tienen valor, false si hay vacío
 */
export function formularioValido(campos) {
    return campos.every(campo => campo.value.trim() !== '');
}

/**
 * Activa o desactiva el botón según si el formulario está completo
 * @param {HTMLButtonElement} boton
 * @param {Array<HTMLInputElement>} campos
 */
export function actualizarBoton(boton, campos) {
    boton.disabled = !formularioValido(campos);
}

/**
 * Valida que un campo tenga solo números
 * @param {HTMLInputElement} campo
 * @param {string} mensaje
 */
export function validarNumero(campo, mensaje) {
    let mensajeError = document.getElementById(`error-${campo.id}`);
    const valor = campo.value.trim();

    if (valor === '' || isNaN(Number(valor))) {
        if (!mensajeError) {
            mensajeError = document.createElement('span');
            mensajeError.id = `error-${campo.id}`;
            mensajeError.style.color = 'red';
            mensajeError.innerText = mensaje;
            campo.parentElement.appendChild(mensajeError);
        }
    } else if (mensajeError) {
        mensajeError.remove();
    }
}

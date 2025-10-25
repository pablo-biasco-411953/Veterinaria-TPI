// validaciones.js

function mostrarError(campo, mensaje) {
    let mensajeError = document.getElementById(`error-${campo.id}`);
    if (!mensajeError) {
        mensajeError = document.createElement('span');
        mensajeError.id = `error-${campo.id}`;
        mensajeError.style.color = 'red';
        campo.parentElement.appendChild(mensajeError);
    }
    mensajeError.innerText = mensaje;
}

function quitarError(campo) {
    const mensajeError = document.getElementById(`error-${campo.id}`);
    if (mensajeError) mensajeError.remove();
}

export function validarCampoVacio(campo, mensaje) {
    if (!campo) return false;
    if (campo.value.trim() === '') {
        mostrarError(campo, mensaje);
        return false;
    } else {
        quitarError(campo);
        return true;
    }
}

/**
 * Valida que las contraseñas coincidan y cumplan criterios de seguridad
 */
export function validarContrasenas(contrasena, repetirContrasena, minLength = 8) {
    let valido = true;

    if (!validarCampoVacio(contrasena, 'Contraseña obligatoria')) valido = false;
    if (!validarCampoVacio(repetirContrasena, 'Repetir contraseña obligatoria')) valido = false;

    if (contrasena.value !== repetirContrasena.value) {
        mostrarError(repetirContrasena, 'Las contraseñas no coinciden');
        valido = false;
    } else if (repetirContrasena.value !== '') {
        quitarError(repetirContrasena);
    }

    const pass = contrasena.value;
    if (pass.length < minLength) {
        mostrarError(contrasena, `La contraseña debe tener al menos ${minLength} caracteres`);
        valido = false;
    } else {
        // Validar que tenga al menos una mayúscula y un carácter especial
        let tieneMayuscula = false;
        let tieneEspecial = false;
        const especiales = '!@#$%&*';

        for (let i = 0; i < pass.length; i++) {
            const c = pass[i];
            if (c >= 'A' && c <= 'Z') tieneMayuscula = true;
            if (especiales.includes(c)) tieneEspecial = true;
        }

        if (!tieneMayuscula) {
            mostrarError(contrasena, 'La contraseña debe tener al menos una letra mayúscula');
            valido = false;
        } else if (!tieneEspecial) {
            mostrarError(contrasena, 'La contraseña debe tener al menos un carácter especial (!@#$%&*)');
            valido = false;
        }

        if (tieneMayuscula && tieneEspecial) {
            // Solo quitar el error si cumple todos los criterios
            quitarError(contrasena);
        }
    }

    return valido;
}

export function validarTexto(campo, min = 2, max = 50) {
    if (!validarCampoVacio(campo, `${campo.placeholder} es obligatorio`)) return false;

    const valor = campo.value.trim();
    const permitidos = 'áéíóúñ ';

    for (let i = 0; i < valor.length; i++) {
        const letra = valor[i].toLowerCase();
        if ((letra < 'a' || letra > 'z') && !permitidos.includes(letra)) {
            mostrarError(campo, 'Solo se permiten letras');
            return false;
        }
    }

    if (valor.length < min) {
        mostrarError(campo, `Mínimo ${min} caracteres`);
        return false;
    }
    if (valor.length > max) {
        mostrarError(campo, `Máximo ${max} caracteres`);
        return false;
    }

    quitarError(campo);
    return true;
}

export function validarNumero(campo, mensaje, minLength = 1, maxLength = 20) {
    if (!validarCampoVacio(campo, mensaje)) return false;

    const valor = campo.value.trim();
    for (let i = 0; i < valor.length; i++) {
        if (valor[i] < '0' || valor[i] > '9') {
            mostrarError(campo, mensaje);
            return false;
        }
    }

    if (valor.length < minLength) {
        mostrarError(campo, `Mínimo ${minLength} dígitos`);
        return false;
    }
    if (valor.length > maxLength) {
        mostrarError(campo, `Máximo ${maxLength} dígitos`);
        return false;
    }

    quitarError(campo);
    return true;
}

export function formularioValido(campos) {
    return campos.every(campo => campo && campo.value.trim() !== '');
}

export function actualizarBoton(boton, campos) {
    let valido = true;

    campos.forEach(campo => {
        if (!campo) return;

        switch (campo.id) {
            case 'nombre':
            case 'apellido':
                valido &= validarTexto(campo);
                break;
            case 'dni':
                valido &= validarNumero(campo, 'DNI inválido', 7, 8);
                break;
            case 'codigo-area':
                valido &= validarNumero(campo, 'Código de área inválido', 2, 4);
                break;
            case 'telefono':
                valido &= validarNumero(campo, 'Teléfono inválido', 6, 8);
                break;
            case 'contrasena':
            case 'repetir-contrasena':
                valido &= validarContrasenas(
                    document.getElementById('contrasena'),
                    document.getElementById('repetir-contrasena')
                );
                break;
        }
    });

    boton.disabled = !valido;
}

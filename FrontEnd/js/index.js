// js/index.js
import { createMascota, getTiposMascota } from './api.js';

const agrandar = document.getElementById("agrandar");
const barraLateral = document.querySelector(".barra-lateral");
const spans = document.querySelectorAll("span");
const main = document.querySelector("main");

if (agrandar) {
    agrandar.addEventListener("click", () => {
        barraLateral.classList.toggle("mini-barra-lateral");
        main.classList.toggle("min-menu");
        spans.forEach(span => span.classList.toggle("oculto"));
    });
}

const token = localStorage.getItem("token");

// Cargar tipos de mascota en select
export async function cargarTipos() {
    try {
        const response = await getTiposMascota();
        if (response.ok) {
            const tipos = await response.json();
            const $tipos = document.getElementById('tipos');
            tipos.forEach(tipo => {
                const $option = document.createElement('option');
                $option.value = tipo.codTipo;
                $option.textContent = tipo.nombre;
                $tipos.appendChild($option);
            });
        } else {
            console.error("Error al acceder al recurso protegido");
        }
    } catch (error) {
        console.error("Error al cargar los tipos:", error);
    }
}

// Crear nueva mascota
export async function nuevaMascota() {
    const $divError = document.getElementById("error");
    const $divOk = document.getElementById("ok");
    const $nombre = document.getElementById("nombre");
    const $edad = document.getElementById("edad");
    const $tipos = document.getElementById("tipos");

    const data = {
        nombre: $nombre.value,
        edad: Number($edad.value),
        codCliente: 0,
        codTipo: Number($tipos.value),
        eliminado: false
    };

    try {
        const response = await createMascota(data);
        if (response.ok) {
            $divOk.hidden = false;
            document.querySelector('form').reset();
        } else {
            $divError.hidden = false;
        }

        const resData = await response.json();
        console.log('Respuesta del servidor:', resData);
    } catch (error) {
        console.error('Error al crear mascota:', error);
        $divError.hidden = false;
    }
}

// Ocultar mensajes
export function cerrar(id) {
    document.getElementById(id).hidden = true;
}

// Exportamos funciones a window si se usan en HTML
window.nuevaMascota = nuevaMascota;
window.cerrar = cerrar;

// Cargar tipos al iniciar (si existe el select)
if (document.getElementById('tipos')) {
    cargarTipos();
}

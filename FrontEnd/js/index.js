// pagina principal
const agrandar=document.getElementById("agrandar");
const barraLateral =document.querySelector(".barra-lateral");
const spans =document.querySelectorAll("span");
const main=document.querySelector("main");
agrandar.addEventListener("click",()=>{
    barraLateral.classList.toggle("mini-barra-lateral");
    main.classList.toggle("min-menu");
    spans.forEach(span => {
        span.classList.toggle("oculto");
    });

})


const token = localStorage.getItem("token");
async function cargar_tipos() {
    try {
        
        const response = await fetch(`https://localhost:7186/api/tiposMascota`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.ok) {
            const tipos = await response.json();
            const $tipos = document.getElementById('tipos');
            tipos.forEach(element => {
            const $option = document.createElement('option');
            $option.value = element.codTipo;
            $option.textContent = element.nombre;
            $tipos.appendChild($option);
            });
        } else {
            console.error("Error al acceder al recurso protegido");
        }    
    } catch (error) {
        console.error("Error al cargar los tipos:", error);
    }
}


function nueva_mascota() {
    const $divError = document.getElementById("error");
    const $divOk = document.getElementById("ok");
    const $nombre = document.getElementById("nombre");
    const $edad = document.getElementById("edad");
    const $tipos = document.getElementById("tipos");

    let data = {
        nombre: $nombre.value,
        edad: Number($edad.value),
        codCliente: 0,
        codTipo:  Number($tipos.value), 
        eliminado:false
    };

    fetch('https://localhost:7186/api/Mascota', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' ,            
            "Authorization": `Bearer ${token}`
            
        },
        body: JSON.stringify(data) 
    })
        .then(response => {
            if (response.ok) {
                $divOk.removeAttribute('hidden')
                document.querySelector('form').reset();
            } else {
                $divError.removeAttribute('hidden')
            }

            console.log(data)
            return response.json();
        })
        .then(data => {
            console.log('Respuesta del servidor:', data); 
        })
        .catch(error => {
            console.error('Error:', error); 
        });

}

function cerrar(id) {
    document.getElementById(id).hidden = true;
}
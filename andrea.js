document.addEventListener("DOMContentLoaded", () => {
    // Crear el contenedor del asistente (Andrea)
    const asistente = document.createElement("div");
    asistente.id = "andrea-avatar";
    asistente.classList.add("fixed-avatar");
    asistente.style.position = "fixed";
    asistente.style.bottom = "20px";
    asistente.style.right = "20px";
    asistente.style.cursor = "pointer";
    document.body.appendChild(asistente);

    // Crear la imagen de Andrea (el avatar)
    const imagen = document.createElement("img");
    imagen.src = "assets/img/icons/andrea.png";  // Ruta de la imagen de Andrea
    imagen.alt = "Avatar Andrea";
    imagen.style.width = "120px"; // Tamaño de la imagen
    imagen.style.height = "auto"; // Mantener proporciones
    asistente.appendChild(imagen);

    // Crear el contenedor para los "pensamientos" de Andrea
    const pensamientoTexto = document.createElement("div");
    pensamientoTexto.id = "pensamiento-texto";
    pensamientoTexto.style.position = "absolute";
    pensamientoTexto.style.left = "130px";  // Junto al avatar
    pensamientoTexto.style.bottom = "10px"; // Mantener alineado al avatar
    pensamientoTexto.style.fontSize = "16px";  // Mejor legibilidad
    pensamientoTexto.style.color = "#333";  // Texto oscuro
    pensamientoTexto.style.backgroundColor = "rgba(255, 255, 255, 0.8)";  // Fondo translúcido
    pensamientoTexto.style.borderRadius = "8px";
    pensamientoTexto.style.padding = "12px";
    pensamientoTexto.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    pensamientoTexto.style.maxWidth = "250px";  // Ajustado para no ocupar demasiado espacio
    pensamientoTexto.style.display = "none";  // Comienza oculto
    document.body.appendChild(pensamientoTexto);

    // Lista de pensamientos que Andrea puede mostrar
    const pensamientos = [
        "¿Te has sentido incómodo con alguna situación en el trabajo? Es importante identificarlo.",
        "Recuerda que si te sientes incómodo, siempre puedes hablar con tu supervisor o recursos humanos.",
        "El hostigamiento laboral no es algo que debas tolerar. Identificarlo es el primer paso.",
        "Si algo te hace sentir mal, es importante hablarlo, no minimices esas situaciones.",
        "Recuerda que tus derechos son importantes. Si te sientes inseguro, existen formas de protegerte."
    ];

    // Función para mostrar los pensamientos de Andrea de forma aleatoria
    let pensamientoIndex = 0;
    function mostrarPensamiento() {
        pensamientoTexto.innerHTML = pensamientos[pensamientoIndex];
        pensamientoTexto.style.display = "block";  // Mostrar el pensamiento

        // Cambiar el pensamiento después de 4 segundos
        pensamientoIndex = (pensamientoIndex + 1) % pensamientos.length;

        setTimeout(() => {
            pensamientoTexto.style.display = "none";  // Ocultar después de un tiempo
        }, 4000);  // Pensamiento visible por 4 segundos
    }

    // Hacer que el pensamiento se mueva junto con el scroll
    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        // Fijar la posición del pensamiento junto al avatar y ajustarlo con el scroll
        pensamientoTexto.style.left = `${asistente.offsetLeft + 130}px`;
        pensamientoTexto.style.bottom = `${10 + scrollY}px`;  // Mueve el pensamiento con el scroll
    });

    // Funcionalidad al hacer clic en el avatar de Andrea
    asistente.addEventListener("click", () => {
        // Mostrar el pensamiento de Andrea
        mostrarPensamiento();
    });
});
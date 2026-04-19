// Este código JS se puede colocar en un archivo aparte como "header.js" o dentro del mismo archivo JS que controles la estructura de tu página

document.addEventListener('DOMContentLoaded', function () {
  // Contenedor del header
  const header = document.querySelector('.site-header');

  // HTML que contiene el contenido del header con iconos
  const headerContent = `
      <nav class="navbar navbar-expand-lg" aria-label="Navegación principal">
        <div class="container">
          <a class="navbar-brand site-brand" href="index.html" aria-label="Ir al inicio">
            <img src="assets/img/logo-promart.png" alt="Logo Promart Homecenter" class="site-brand__logo" />
          </a>
          <button class="navbar-toggler site-nav__toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Abrir menú de navegación">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNav">
            <ul class="navbar-nav ms-auto me-lg-3 site-nav">
              <li class="nav-item">
                <a class="nav-link" href="index.html#inicio">
                  <i class="fas fa-home nav-icon"></i> Inicio
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="index.html#rutas">
                  <i class="fas fa-link nav-icon"></i> Rutas
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="index.html#senales">
                  <i class="fas fa-exclamation-circle nav-icon"></i> Señales
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="escenarios.html">
                  <i class="fas fa-search nav-icon"></i> Casos
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="guia.html">
                  <i class="fas fa-info-circle nav-icon"></i> Guía
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="recursos.html">
                  <i class="fas fa-exclamation-triangle nav-icon"></i> Recursos
                </a>
              </li>
            </ul>
            <a class="btn btn-primary btn-sm site-nav__cta" href="reporte.html">
              Necesito orientación
            </a>
          </div>
        </div>
      </nav>
    `;

  // Inserta el contenido del header dinámicamente
  header.innerHTML = headerContent;
});
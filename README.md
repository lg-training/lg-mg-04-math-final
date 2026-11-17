# Mi aventura matemática

Sitio de repaso de matemáticas para cuarto de primaria, con 42 preguntas interactivas y un taller imprimible que añade seis actividades para dibujar y construir gráficos. El PDF incluye respuestas al final.

El repaso cubre operaciones, propiedades de la multiplicación, múltiplos y factores, conjuntos, fracciones, geometría y estadística. Aquí se interpretan las fracciones «regulares e irregulares» como propias e impropias.

## Ver el sitio localmente

Abre `site/index.html` en un navegador. No se necesitan instalar dependencias ni ejecutar una compilación.

El progreso se guarda en el navegador cuando el almacenamiento local está disponible; no se envía a ningún servidor. Puede borrarse con el botón **Reiniciar progreso**. Si el navegador bloquea ese almacenamiento, se puede practicar igualmente, pero el progreso no se conservará al cerrar la página.

## Actualizar el taller

Las preguntas compartidas por el sitio y el PDF están en `site/questions.js`. Después de editarlas, regenera el PDF con Python 3:

```sh
python3 scripts/generate_pdf.py
```

Las actividades de dibujo y sus respuestas están en `scripts/generate_pdf.py`. Incluye el PDF regenerado al subir los cambios.

Para comprobar la estructura de las preguntas y los principales controles del sitio, ejecuta `node scripts/test_site.js`.

## Publicar en GitHub Pages

1. Sube estos archivos a la rama `main` del repositorio en GitHub.
2. En GitHub, abre **Settings → Pages** y selecciona **GitHub Actions** como fuente en **Build and deployment**.
3. En **Actions**, ejecuta el flujo **Publicar en GitHub Pages** con **Run workflow**, o sube un nuevo cambio a `main`. El flujo publicará automáticamente el contenido de `site/`.
4. Consulta **Settings → Pages** o el resultado del flujo para encontrar la dirección publicada.

Si el repositorio se llama `lg-mg-04-math-final` y no se configura un dominio personalizado, la dirección prevista es `https://lg-training.github.io/lg-mg-04-math-final/`. GitHub Pages y Actions deben estar habilitados para el repositorio y disponibles en su plan; puede que se necesiten permisos de administrador para cambiar la configuración.

Los enlaces a imágenes, scripts, estilos y al PDF deben usar rutas relativas, por ejemplo `./taller-matematicas.pdf`, para funcionar también bajo la ruta del repositorio.

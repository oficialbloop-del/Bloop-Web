# Bloop · página de descarga

Página para descargar siempre la versión más reciente de Bloop. Es estática (HTML, CSS y JS, sin compilar nada), así que funciona tal cual en GitHub Pages.

## Cómo se mantiene al día sola

Al abrirse, la página lee `latest.json` del bucket `releases` de Supabase, el mismo que usa la app para actualizarse. De ahí saca la versión, las notas, el peso y el enlace del APK, y el botón descarga `Bloop-<versión>.apk`.

Cuando publicas con `./publish.sh "notas"`, la página muestra la nueva versión sin que toques nada. Si `latest.json` no carga (por ejemplo, con mala señal se reintenta 4 veces), el botón descarga igual `bloop-latest.apk`, que también es siempre la última.

## Subirla a GitHub Pages

1. Entra a github.com/new y crea un repositorio público. Si le pones de nombre `bloop`, la página queda en `https://TU_USUARIO.github.io/bloop/`.
   *Si ya tienes la página vieja (`web/index.html`) publicada en un repositorio, usa ese mismo y reemplaza sus archivos: así conservas la misma dirección.*
2. En el repositorio, toca **Add file → Upload files** y arrastra **lo que hay dentro** de esta carpeta: `index.html`, `styles.css`, `app.js` y la carpeta `assets`. Luego toca **Commit changes**.
3. Ve a **Settings → Pages**. En *Build and deployment* elige **Deploy from a branch**, rama **main** y carpeta **/ (root)**, y toca **Save**.
4. En uno o dos minutos la página queda publicada. GitHub te muestra la dirección arriba, en esa misma pantalla.
5. Para que WhatsApp, Instagram y Facebook muestren la imagen al compartir el enlace, abre `index.html` y cambia `content="assets/compartir.jpg"` por la dirección completa, por ejemplo `content="https://TU_USUARIO.github.io/bloop/assets/compartir.jpg"`.

## Qué hay aquí

| Archivo | Para qué |
|---|---|
| `index.html` | La página |
| `styles.css` | Diseño: colores y tipos de la app, adaptado a celular |
| `app.js` | Lee la última versión, mueve a la criatura y muestra el QR en computador o el aviso en iPhone |
| `assets/` | Fuentes de la app, icono, QR, imagen para compartir y el video promocional (versión liviana de 2,6 MB) |

El QR apunta a `bloop-latest.apk`, así que nunca hay que regenerarlo.

Si algún día editas `styles.css` o `app.js`, sube el número de `?v=2` en `index.html` (a `?v=3`, etc.). Si no, los navegadores pueden seguir mostrando la versión vieja guardada.

Para verla en tu computador antes de subirla, ejecuta `python -m http.server` dentro de esta carpeta y abre `http://localhost:8000`.

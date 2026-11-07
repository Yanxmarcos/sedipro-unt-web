# Versiones y novedades · panel

## Alcance y autoridad

Modo **Read**. `/panel/versiones` permite conocer la evolución del sistema a
todos los roles del panel. Es una extensión ordinaria del mundo interno ya
establecido: conserva Geist, componentes compartidos, colores semánticos,
bordes, foco y temas claro y oscuro. No introduce identidad, tokens, fuentes,
imágenes ni una gramática de movimiento nueva.

El contrato local de dirección y calidad es
`../review/panel-versions/direction.md`; la revisión inicial es
`../review/panel-versions/finish-review.md`, con disposición **ship** y sin
correcciones materiales pendientes en su alcance original. La simplificación
posterior de textos solicitada por el usuario se registra abajo. La composición responde a las referencias
editoriales aportadas y al encargo confirmado. No corresponde crear una nueva
propuesta de mundo visual ni afirmar una comp aprobada.

## Contenido y procedencia

`src/lib/app-version.mjs` establece la versión actual **2.4.0**.
`src/lib/releases.mjs` contiene **16 versiones y 82 cambios**, desde 2.4.0 hasta
0.0.1 en orden descendente. Los hitos cubren las primeras bases del panel,
padrón, asistencias, votaciones, varias etapas de SEDInvita, renovación,
eventos, certificados, enlaces y QR.

El usuario autorizó agrupar retrospectivamente los hitos históricos como
versiones. Esta procedencia se conserva en el código y en este contrato; por
petición posterior del usuario no se muestra una nota explicativa en la vista. No constituye
una reconstrucción de etiquetas Git: no se inventan fechas de publicación,
autores ni lanzamientos fechados. Las listas describen avances existentes y
no presentan funciones pendientes como terminadas. Al actualizar el historial,
mantener esa distinción y la fuente compartida de la versión actual.

## Composición y lectura

`src/app/panel/versiones/page.js` muestra un encabezado centrado con versión
actual, propósito, etiqueta de actualidad y regla horizontal. El primer
viewport permite reconocer la cronología, encontrar el índice y empezar a leer
las mejoras de QR. El título es «Versión 2.4.0 · Sistema web de SEDIPRO UNT».
Por petición del usuario, cada artículo muestra únicamente el encabezado de
versión y su lista de cambios, conservando el badge Actual en la más reciente;
se retiraron los títulos de hitos y sus subtítulos. Divisores finos y espacio vertical separan
los hitos; no hay tarjetas anidadas ni ilustraciones decorativas.

El contenedor tiene un ancho máximo de 64rem. El texto de las listas se limita
a **75ch**, con cuerpo de 14px e interlínea de 24px. La jerarquía compacta y el
tratamiento plano pertenecen al panel; la tipografía monumental y la paleta
editorial pública no son autoridad para esta vista.

En escritorio amplio, el índice ocupa una columna lateral de 10rem y permanece
visible al desplazarse. En anchos inferiores a 1024px se sustituye por el
desplegable nativo **Explorar versiones**, con enlaces en tres columnas. Los
enlaces apuntan a identificadores estables derivados de cada versión y los
artículos reservan espacio superior para la cabecera fija. La navegación por
anclas y el desplegable funcionan sin JavaScript adicional de la página.

## Acceso y pie compartido

`src/lib/panel-permissions.mjs` permite esta ruta a Sediprano, Directiva,
Administrador y Superadministrador, respetando la normalización de los alias
legados. El historial no es exclusivo de gestión.

`src/components/admin/Footer.tsx` conserva copyright a la izquierda y cuatro
accesos a la derecha, en una fila:

- **Documentación** mantiene `https://api-sediprount.vercel.app` y abre una pestaña nueva.
- **Manual de Usuario**, junto a Documentación, abre el PDF de Drive indicado por el usuario en otra pestaña, con `noopener noreferrer`.
- **Reportar** mantiene `mailto:ti.sedipro@unitru.edu.pe`; el tooltip indica «Si has encontrado un problema, por favor escríbenos a ti.sedipro@unitru.edu.pe para que podamos atenderlo. 🙂», con el correo en negrita.
- **Versión 2.4.0** abre `/panel/versiones` y obtiene el número de la fuente compartida.

Desde 768px se muestran las etiquetas. Por debajo se muestran los iconos
BookOpen, BookUser, Bug y Tag, cada uno con nombre accesible, foco visible y área de
44×44px. La etiqueta Reportar se acortó para esta extensión. El copyright y
los cuatro enlaces permanecen en la misma línea incluso a 320px; bajo 360px
el padding horizontal se reduce a 8px y la separación entre grupos a 4px.

Esta página solo lee contenido local. La extensión no requiere API, estados
de guardado, cambios del backend ni escrituras en servicios o datos de nube.

## Evidencia y límites

La evidencia final recibida registra **dos pruebas Playwright aprobadas
(31.9s)** con APIs simuladas: acceso de los cuatro roles, navegación desde el
footer y mediante el índice, nombres accesibles y ausencia de desbordamiento
horizontal a 1440, 768, 390 y 320px en los dos temas. El build de producción,
lint y formato de los archivos modificados aprobaron después del último cambio.
El build incluye `/panel/versiones`; permanece la advertencia preexistente de
la fuente de respaldo CascadiaCode.

Las **16 capturas de viewport** están en
`../review/panel-versions/{top,footer}-{1440,768,390,320}-{light,dark}.png`.
La revisión abrió todas mediante las hojas de contacto y examinó originales
para detalles de escritorio, tablet y 320px. Confirma el encabezado, la lectura,
el índice y el footer sin colisiones ni recortes materiales en esos estados.
Son capturas de inicio y pie, no de toda la cronología. El indicador flotante
de Next.js pertenece al entorno de desarrollo.

El contexto/detector Impeccable no estuvo disponible por
`cache_directory_failed`; no se le atribuyen resultados. No hubo validación
en hardware físico ni auditoría instrumental de contraste. El alcance de ship
se limita a esta página, el footer y las fuentes de permisos/contenido revisadas.

## Contexto existente que se conserva

`PRODUCT.md` mantiene el alcance histórico del rediseño público, que excluía el
panel. `DESIGN.md` sigue describiendo principalmente ese mundo público y ya
contiene extensiones internas posteriores. Su párrafo del pie todavía describe
dos accesos y la etiqueta anterior «Reportar un problema»; esta superficie
registra el comportamiento vigente de tres accesos y «Reportar». Es una deriva
documental preexistente que se informa sin repararla en este encargo.

Este documento es el registro local de la extensión. Se conservan `README`,
`PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json` y los demás contratos de
superficie; no se promueve esta composición a regla global del sistema.

### Simplificación de textos · 6 de noviembre de 2026

Se actualizó el título principal a «Versión 2.4.0 · Sistema web de SEDIPRO UNT»
y se retiraron la nota retrospectiva visible, los títulos de hitos y sus fases.
Se conservan los 16 números de versión, las 82 entradas, el badge Actual,
el índice y todos los accesos del footer. El lint aprobó. Las pruebas existentes
de navegación por los cuatro roles y de presentación en cuatro anchos y ambos
temas aprobaron; la navegación permite ahora la compilación inicial más lenta
del servidor de desarrollo. Se inspeccionaron las capturas actualizadas de
escritorio oscuro y móvil claro de 320px, sin desbordamiento del título.

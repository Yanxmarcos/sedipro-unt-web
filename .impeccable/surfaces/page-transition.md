# Transición compartida de entrada y navegación

## Authority and scope

Extensión ordinaria del sitio existente, solicitada para la entrada inicial y la navegación entre `/`, `/proyectos`, `/nosotros` y, por ampliación expresa del usuario, `/login`. Hereda los compromisos de [PRODUCT.md](../../PRODUCT.md), los colores `public-blue` y `public-paper` de [DESIGN.md](../../DESIGN.md) y la frontera pública de [design.json](../design.json). El formulario y la autenticación de acceso conservan su implementación. No establece otro mundo visual ni modifica reglas globales, panel, eventos o TI.

## Direction contract

**THESIS:** Una cortina azul con avance medido prepara la vista y se abre rasgando el logotipo por una costura horizontal irregular.

**OWN-WORLD:** Azul público (#304d90), papel público (#f6f1fa), Geist ya cargada en la raíz y el SVG institucional existente. Valores locales del componente; no se incorporan tokens al sistema.

**STORY:** El visitante reconoce SEDIPRO, lee el porcentaje de recursos iniciales preparados y accede a la vista cuando estos terminan o vence el límite de espera. El porcentaje describe preparación, no bytes descargados ni todo el contenido de la página.

**FIRST VIEWPORT:** Cortina fija de ancho completo, SVG centrado, esquina inferior izquierda vacía, contador tabular abajo a la derecha y línea de avance al pie. Las etiquetas de preparación permanecen solo en la información accesible. No añade acciones ni cambia la composición subyacente.

**FORM:** Petición estrecha fijada por el usuario: dos mitades complementarias con borde dentado, cierre de 340ms y apertura de 850ms, superior hacia arriba e inferior hacia abajo. No corresponde torneo de conceptos ni semilla de otro mundo.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementation and behavior

[PublicPageTransition](../../src/components/page-transition/public-page-transition.jsx) lee el [SVG aportado](../../public/logos/sedi-logo.svg) y lo incluye en el HTML, sin petición de imagen adicional. [RootLayout](../../src/app/layout.js) monta el envoltorio compartido. [PageTransition](../../src/components/page-transition/transition.jsx) emite desde SSR el estado inicial de carga y contador `00`; la [hoja local](../../src/components/page-transition/transition.module.css) da color y geometría desde el primer render. [tear-geometry.mjs](../../src/components/page-transition/tear-geometry.mjs) genera una única costura determinista que encaja en ambas mitades, también durante hidratación.

[readiness.mjs](../../src/components/page-transition/readiness.mjs) espera documento, hojas de estilo, fuentes y carga/decodificación de imágenes que intersectan el primer viewport, después de dos cuadros de render. El contador 0–100 expresa tareas asentadas del conjunto observado; los errores de recurso también asientan su tarea. Excluye fotos fuera de pantalla y videos diferidos. No usa tiempos para fabricar avance. El límite de recursos de 10s o el de llegada de ruta de 15s liberan la cortina conservando el último porcentaje, sin imponer 100.

Los enlaces siguen siendo anclas. Solo se intercepta la activación primaria, sin modificadores, hacia otra ruta de este conjunto y del mismo origen. Se conservan pestañas nuevas, enlaces externos, descargas y destinos de la misma ruta; atrás/adelante activa preparación de la llegada. Durante la operación el contenido queda `inert` y el scroll se bloquea; al terminar una navegación el foco pasa al h1. El progreso expone valor y etiqueta accesibles, con aviso de estado breve. Con movimiento reducido se omite la separación y se desvanece en 120ms. `noscript` oculta la cortina; si la hidratación no inicia, CSS la retira a los 12s sin haber vuelto inerte el contenido.

## Comparison and evidence

La comparación de fuente confirma reutilización de los dos colores existentes, fuente raíz y logotipo institucional, con movimiento limitado a esta transición. No exige cambios duraderos de sistema: se preservan `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, la documentación TI y las demás superficies. Cualquier divergencia histórica de los documentos raíz queda fuera de esta extensión.

El documentador inspeccionó los archivos enlazados y las capturas reales de apertura al 100%: [1280px, HOME](../review/loader-desktop.png) y [390px, acceso](../review/loader-mobile.png). Muestran las mitades separándose a todo el ancho y el contenido existente a través de la abertura. Son capturas del servidor de desarrollo; el indicador de incidencias de Next es ajeno al componente.

Refinamiento final solicitado: se retiraron del DOM los textos visibles «Preparando…» y «Recursos de esta vista» y sus reglas locales, en todos los anchos. El implementador verificó en navegador su ausencia en `innerText` y el contador al 100%; [captura de escritorio vigente](../review/loader-no-caption-desktop.png). Las dos capturas anteriores son históricas para esa leyenda, incluida la móvil. No se añadieron pruebas por esta eliminación de bajo impacto; la etiqueta ARIA y el estado accesible permanecen.

El documentador leyó las [seis pruebas Node](../../tests/page-transition/readiness.test.mjs): destinos autorizados, guardas de enlaces nativos, fuentes y decodificación de imágenes visibles, recursos en caché, límite de espera y cancelación. El implementador comunicó sus seis resultados aprobados y ESLint aprobado. También comunicó comprobaciones de navegador en las cuatro rutas: llegada a 100 e idle, menú, Enter en móvil, foco del encabezado y atrás; `/#historia` y su regreso nativo a `/` permanecen en idle con el overflow de HTML restaurado. El documentador no repitió esas ejecuciones. Movimiento reducido y `noscript` se verificaron únicamente en fuente. La petición HTTP directa de SSR quedó bloqueada por el socket del entorno; se comprobó el marcado de fuente y la entrada inicial en navegador, sin afirmar que esa prueba HTTP pasó. El detector Impeccable no se repitió tras el fallo previo `cache_directory_failed`.

La revisión final comunicada por el implementador antes de retirar la leyenda emitió **ship**, sin correcciones solicitadas. La revisión independiente acotada del refinamiento también emitió **ship**, sin hallazgos: confirmó la ausencia de los textos visibles, el contador conservado y las etiquetas accesibles en fuente. Su alcance es esta transición compartida y su integración; no certifica otras superficies ni las alternativas accesibles no emuladas visualmente.

## Actualización vigente: mensaje único de espera

La petición posterior del usuario sustituye las notas anteriores sobre porcentaje, contador, línea de avance y leyendas: la cortina muestra únicamente el logotipo y «Espera un momento, estamos preparando todo para ti.». El mensaje usa Geist de 14px, peso 400, alineación inferior derecha y ajuste equilibrado de líneas; hasta 600px conserva márgenes laterales de 24px y separación inferior de 42px. La tesis vigente es una cortina azul que prepara la vista y se abre rasgando el logotipo; ya no representa numéricamente esa preparación.

Se retiraron contador, pista de progreso, estado numérico y atributos ARIA de progreso. El aviso accesible `role="status"` anuncia la misma frase. `waitForView` sigue esperándose con un callback vacío; se conservan los recursos observados, límites de espera, cancelación, guardas de navegación, gestión de foco, azul, logotipo, costura y alternativa de movimiento reducido. Las afirmaciones históricas de llegada visual a 100% dejan de describir la interfaz vigente.

La revisión independiente inspeccionó fuente y las capturas reales de carga [1280×720](../review/loader-message-only-desktop.png) y [390×844](../review/loader-message-only-mobile.png): mensaje completo y legible, dos líneas equilibradas en móvil, sin contador ni pista. El implementador comunicó comprobaciones de navegador de frase exacta, ausencia de `progressbar` y `aria-valuenow`, ausencia de desbordamiento móvil, navegación HOME↔Nosotros y menú→Nosotros con retorno a idle; también ESLint y `git diff --check` aprobados. No se añadieron pruebas para este cambio de presentación reversible y `readiness.mjs` permanece intacto. El detector sigue sin estar disponible por el fallo previo del lanzador. Dictamen de esta revisión estrecha: **ship**, sin correcciones materiales. Esta actualización prevalece sobre las notas históricas de presentación y evidencia anteriores; no modifica los documentos raíz ni certifica otras superficies.

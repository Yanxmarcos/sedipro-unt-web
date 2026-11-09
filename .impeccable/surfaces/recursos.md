# Recursos institucionales · /panel/recursos

## Ajuste solicitado · 2026-11-08

El acceso rápido de Canva en las tarjetas usa el logo de 20 px, sin borde, sombra
ni recuadro visible, incluso al pasar el puntero. Conserva un área pulsable de
44 × 44 px, tooltip y foco de teclado. El botón con texto del detalle se conserva.

El subtítulo actual es «La marca de SEDIPRO UNT, siempre a la mano.». Los proyectos
se retiraron del catálogo y del generador; sus archivos públicos originales se
conservan. Cada variante visual tiene su propia tarjeta y abre esa variante exacta;
las blancas se inspeccionan sobre fondo oscuro. Los formatos están en el detalle,
ZIP es secundario y se conserva Fuente Illustrator.

Estado actual: 38 recursos fuente y 63 tarjetas visuales. SEDIPRO UNT aporta
2 recursos / 5 tarjetas; isotipos, 6 / 12; áreas, 10 / 25 (las cinco insignias
circulares primero y después las 20 variantes de logos); Hito, 20 / 21.
PNG parte de 4096 px de lado mayor; los PNG vectoriales del ZIP también usan
4096. Los raster del ZIP conservan sus originales, sin ampliación automática.

Mode: Operate. Approved curated catalogue for every internal role. Existing panel
is the visual authority: Geist, semantic light/dark surfaces, incumbent buttons,
inputs, selects, badges and dialogs. Preserve the public landing and README.

## Direction contract

THESIS: Find an approved SEDIPRO mark or Hito pose and download the right variant.
Show each visual variant as its own card; never repeat a card for every file format.
White variants preview on a dark surface. Opening a card selects that exact variant.

OWN-WORLD: Inherit the internal panel shell and semantic component system. Let
the official assets supply color. Checkerboards communicate real transparency.

STORY: Search or choose a category, inspect a resource, select a variant, format,
size and background, then download. State actual source dimensions honestly.

FIRST VIEWPORT: Existing sidebar/header, concise page title and Illustrator source
download, search and wrapping category controls, then the responsive resource grid.
Cards show artwork, name, dimensions/vector status and a clear detail action.

FORM: User-selected svgl-inspired gallery within the established panel. Code-led,
precisely specified extension; no visual-world replacement or concept tournament.
Detail uses the incumbent focused dialog to configure an export and inspect alpha.
The five restored area insignias are delivered at 4096 × 4096 with actual transparency.
Their lower mark is composed from the official ALL-WHITE SEDIPRO UNT vector,
including the smaller UNT line. Never let AI redraw/omit that signature.
Restore once; use small gallery/detail previews and fetch the 4K master on download.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Asset boundaries

Preserve originals. Never treat a resized raster as native 4K or a PNG in an SVG
wrapper as vector. Extract actual Illustrator paths; retain source colors and
original native PDF. AI enhancements are separate derivatives, not replacements.
Hito must retain the original face, eyes, beak, feathers, proportions, pose and
colors. The original mascot and the landing mascot are the comparison authority.
The user accepted the Executive restoration sample on 2026-11-08. Other restored
screenshots require review; do not silently ship changed features, colors or logos.

The original no-MongoDB/no-audit-collection boundary was superseded by the user's
explicit audit request below. No upload administration, new global tokens or
changes to existing QR/link behavior. Public distribution of institutional assets
was disclosed in the approved plan. Files in public are not private.

## Estado de entrega actual · 2026-11-08

Implementado en `feat/recursos-institucionales` para todos los roles internos,
con búsqueda y categoría combinables. Hereda Geist, shell y controles semánticos
claro/oscuro del panel; no incorpora tokens globales. `DESIGN.md`,
`.impeccable/design.json` y README se conservan sin cambios.

Los formatos dependen de la variante. SVG usa trazados reales; los 25 PDF conservan
vectores y omiten datos privados de edición de Illustrator. PDF y original se
descargan sin personalización. Los otros formatos admiten tamaño original y lado
mayor de 1024, 2048 o 4096 px con proporciones conservadas; JPG lleva fondo sólido.
El ZIP por recurso incluye SVG/PDF disponibles, PNG vectoriales a 4096 y originales
raster, más un LEEME. El AI original de 26 060 744 bytes permanece intacto y su
descarga se comprobó byte a byte.

Las cinco insignias se restauraron desde capturas borrosas con la herramienta
integrada de imágenes. Las placas intermedias de limpieza eliminan temporalmente
la firma inferior; NO son el arte entregado. Cada maestro final es WebP lossless
de 4096 × 4096 con alpha, compuesto con el vector oficial completamente blanco
de SEDIPRO UNT, incluida la línea UNT pequeña. La preparación amplía placas de
1254 × 1254; no recupera fotografía nativa 4K. El detalle muestra esas dimensiones
de fuente. Prompts, referencias y placas están registrados en
`scripts/resources/insignias/procedencia.json`; `prepare-catalog.mjs` recompone
el pie oficial. No entregar placas vacías ni versiones sin UNT.

Hito conserva los 18 PNG originales de 1080 px con alpha y la bienvenida existente.
Corriendo ahora ofrece solo la variante `sin-fondo`, «Sin fondo», calidad «Recorte
sin fondo»: PNG de 1402 × 1122 con alpha, preparado con edición integrada de imagen.
El negro estaba incrustado en el original opaco; ese original se conserva intacto
en `public/recursos/originales/hito-corriendo.png` como archivo de referencia y
ya no se lista ni exporta. El catálogo usa
`public/recursos/mejorados/hito-corriendo-sin-fondo-v1.png` y una vista versionada.
PNG a 4096 y «Archivo original» descargan el recorte transparente; este último
conserva los 1402 × 1122 del recorte publicado, no devuelve el original opaco.
Prompt y procedencia: `scripts/resources/hito-corriendo-recorte.json`.
Ejecutivo mantiene su mejora aprobada separada de 1254 × 1254. La muestra de cámara
no se publica. No se afirma haber restaurado todas las capturas.
Hay 158 entradas de procedencia para los
archivos de entrega en `public/recursos/procedencia.json` y
`.impeccable/assets-provenance.json`: 159 archivos incluido el manifiesto,
63 237 371 bytes (60,3 MiB). Se mantienen 38 recursos fuente y 63 tarjetas.

### Auditoría autorizada · versión 2.5.0

El usuario amplió el alcance para registrar uso del módulo como en Certificados.
Frontend y backend usan `feat/recursos-institucionales`. Los cuatro roles internos
conservan el catálogo; solo Superadministrador puede abrir
`/panel/recursos/auditoria`, consultar o eliminar su historial, con comprobación
en interfaz y servidor. Se reutilizan tabla, filtros, paginación y confirmaciones
del panel. No hubo cambios de imágenes, README ni diseño en esta ampliación.

La colección nueva `auditoria_recursos` guarda metadatos, nunca imágenes: actor
actual resuelto por servidor, entrada al módulo, vista de variante, copia PNG,
descarga individual, kit o fuente AI y configuración válida. La UUID hace idempotente el
registro. Resultados: `registrada` para visitas, `iniciada` para preparación,
`descarga_iniciada`, `copiada`, `fallida` o `cancelada` al finalizar. El cliente registra el
inicio antes de generar el archivo y reporta éxito después de `anchor.click()`:
«Descarga iniciada» no demuestra que el archivo se guardó. Si falla informar el
resultado se avisa; las visitas no bloquean el uso y comunican fallos de registro.

API: `POST /api/recursos/actividad`, `PATCH /api/recursos/actividad/[id]`,
`GET/DELETE /api/recursos/auditoria`, `DELETE /api/recursos/auditoria/[id]`.
La auditoría permite búsqueda, acción, resultado y páginas de 20. Eliminar una
entrada o limpiar todo requiere confirmación explícita. La limpieza respeta el
corte de la vista y no borra operaciones activas de menos de 15 minutos ni entradas
modificadas después del corte. La API crea índices al usarse; no se hicieron
escrituras en MongoDB de la nube durante el trabajo.

El backend valida recursos, nombres y formatos mediante
`src/lib/resource-audit-catalog.json`, metadatos de 38 recursos / 63 variantes.
Sincronizar con `node tools/sync-resource-audit-catalog.mjs` desde backend cada vez
que cambie el catálogo frontend. No se añade una fuente al dashboard y el feed
del sistema excluye defensivamente `recursos`. Estos eventos no generan entradas
en el historial de versiones. Por regla explícita del usuario, ninguna novedad
pública debe mencionar auditoría ni registros internos. La versión 2.5.0 incluye
catálogo, Hito y copia PNG para Canva; se retiraron las menciones de auditoría de
2.3.0 y 2.5.0 y se describe el contador de clics sin hablar de logs. 2.4.0 permanece.

Los archivos estáticos siguen públicos: se audita el uso del panel, no todas las
descargas por URL directa. Verificación actual: 4 pruebas unitarias backend y
8 frontend aprobadas; integración real con MongoDB local aislado, backend y proxy
frontend aprobada. Los 11 comportamientos de navegador aprobaron: 10 inicialmente
y el caso de auditoría tras ampliar solo su espera de 5 a 30 s por compilación en
frío (22,9 s total / 15,2 s el caso). Cubre 1440 y 390 en claro/oscuro y confirmación.
Builds de producción frontend (23,8 s) y backend (14,7 s), lint y diff check
aprobados. No cambió la implementación tras builds/capturas.
`finish-review-audit.md` emitió `ship` para esta ampliación, sin hallazgos materiales.
El revisor abrió las cinco capturas de auditoría (1440/390 claro/oscuro y
confirmación móvil) y la galería oscura de un rol sin acceso a auditoría. Revisó
código y evidencia; no reejecutó suites, builds ni pruebas en la nube.

### Copiar PNG para Canva · ajuste autorizado

Cada tarjeta incorpora un botón compacto de al menos 44 px con el icono Canva
aportado; el detalle ofrece «Copiar PNG para Canva». Se copia el PNG real de
`createResourceFile`, nunca una captura, miniatura o URL. La tarjeta usa lado mayor
4096 y transparencia si la fuente la admite, blanco en caso contrario; el detalle
respeta variante, tamaño y fondo aunque esté seleccionado SVG u otro formato de
descarga. Todas las descargas, ZIP y Fuente Illustrator se conservan.

La Clipboard API exige contexto seguro y comprobación de soporte. La escritura
se inicia desde el gesto con una promesa de PNG para compatibilidad con Safari,
sin afirmar garantía en Safari ni Canva móvil. Hay bloqueo de copia simultánea,
cancelación al desmontar, estado ocupado/check de 4 s, tooltip con rol/ID y
`aria-describedby`, y aviso de éxito solo cuando el navegador acepta la escritura.
Permiso denegado o falta de soporte ofrecen «Descargar PNG», sin fingir una copia
de texto. Auditoría: `copiar_recurso`, solo PNG, pasa de `iniciada` a `copiada`,
`fallida` o `cancelada`; el servidor impide `copiada` en acciones de descarga.
«Copiada al portapapeles» no prueba que se pegó en Canva. Sigue excluida del feed.

`public/logos/canva.svg` es copia íntegra del archivo del usuario, SHA-256
`2B790D2600BCCAF67239EFFB4E75681EE63838C9B2BC3B1D0D03D7DD271A73B4`, registrada
en procedencia global como recurso no raster preservado. No cambia los 38/63 ni
los 159 archivos de `public/recursos`. Evidencia recibida: 8 Node frontend y 5
backend, integración real aislada Mongo/API/proxy y 3 Playwright de clipboard
aprobadas (24 s); PNG real Chrome 4096 × 1589 con alpha y RGBA idéntico a descarga,
Ctrl+V nativo en receptor simulado de otro origen con iguales dimensiones,
detalle 2048 × 795 negro, SVG disponible y errores sin falso éxito. Los builds
backend (6,4 s) y frontend final (11,7 s) aprobaron. El editor real de Canva no se
validó: solo se observó su inicio público sin sesión, sin login ni cargas.
El caso previo de Hito afectado por el selector amplio de imágenes aprobó al usar
su imagen semántica (4,1 s; tres casos focalizados, 27 s total). Los 14
comportamientos tienen resultado aprobado: 10 anteriores, Hito y tres de clipboard.
La recaptura final aprobó (22,2 s total / 15,5 s el caso) tras esperar imágenes
visibles/decodificadas, alternar el tema mediante el ThemeProvider real y dejar
terminar avisos previos. Hay ocho capturas finales: tarjeta 1440 oscuro, copia
aceptada 1440 oscuro, cuatro detalles 1440/390 claro/oscuro y galerías 390 oscuro/
400 claro, sin controles ocultos. Lint y diff check aprobaron; no hubo cambios
funcionales tras los builds. `finish-review-canva-copy.md` emitió `ship` sin
hallazgos materiales tras abrir individualmente las ocho capturas con arte
cargado y controles móviles despejados. La igualdad de píxeles corresponde al
PNG representativo probado; el pegado en el editor real de Canva sigue sin verificar.

### Revisión y evidencia actuales

Tras el recorte de Corriendo se registran 7 pruebas Node y una prueba Playwright
focalizada aprobadas (16,2 s), con galería/detalle a 1440 claro y 390 oscuro,
PNG 4096 y archivo fuente transparentes. Capturas:
`corriendo-{galeria,detalle}-{1440-light,390-dark}.png`, más controles de alpha
`hito-corriendo-control-{claro,oscuro}.png`. Lint y diff check aprobados.
`finish-review-corriendo.md` emitió `ship` sin hallazgos materiales para este
recorte, tarjeta y detalle. El revisor abrió las cuatro capturas y ambos controles,
confirmó por SHA-256 el original archivado intacto y midió 1 215 795 píxeles con
alpha 0 y cuatro esquinas transparentes. Es fidelidad visual, no igualdad de
píxeles del personaje tras una edición generativa; no amplía la revisión del catálogo.
En aquel cierre no se conservó la salida del build del recorte; los builds
posteriores de la ampliación de auditoría indicados arriba sí están verificados.

Evidencia del ajuste previo de tarjetas e insignias: 6 pruebas Node aprobadas,
también ejecutadas por el revisor
independiente: incluyen los cinco maestros 4096 con alpha, comparación de píxeles
con el vector oficial en el pie y su región UNT pequeña, y orden visible de áreas.
De siete casos de navegador, seis aprobaron inicialmente; el restante falló por
una aserción que incluía el texto de flecha del selector. Corregido el localizador
al valor del selector, aprobó en 24,5 s. Dos casos finales focalizados (selección
blanca, PNG real 4K, descarga íntegra del AI y matriz responsive) aprobaron en
34,7 s. Los otros seis comportamientos conservaron su aprobación. Build de esa versión
aprobado (compilación 14,3 s), lint y diff check aprobados.

La evidencia visual fresca incluye 17 capturas requeridas y recortes centrales
en `.impeccable/review/recursos/`: la matriz anterior ahora muestra 63 tarjetas,
más `insignias-1440-light.png`, `insignia-detalle-1440-light.png` y
`insignias-finales-control.png`, control de los cinco pies finales. La revisión
independiente del ajuste emitió `ship` para interfaz, catálogo y activos, sin
hallazgos materiales, en `finish-review-variantes.md`; es un veredicto nuevo y no
hereda el `ship` histórico. D1 quedó resuelta tras relectura de la documentación de
esa versión; el revisor confirmó entonces sus totales y las seis pruebas Node.
Este veredicto precede al recorte posterior de Corriendo.

### Historial de la primera entrega

La instantánea inicial fue 36 recursos / 61 variantes, incluidos tres proyectos,
con 148 entradas de procedencia. Tras retirar proyectos hubo una instantánea
intermedia de 33 / 58 y 142 entradas. Ambas están superadas por el estado actual
38 / 63. Antes del recorte de Corriendo hubo 157 entradas, 158 archivos y
62 584 400 bytes (59,7 MiB); el estado actual es el indicado arriba. El ZIP
vectorial a 2048 y los 37,9 MiB corresponden solo
a esa entrega anterior, no a la actual.

`.impeccable/review/recursos/finish-review.md` conserva el primer `fix` y el `ship`
histórico limitado a F1/F2 resueltos: HEX oculto inválido bloqueaba PDF/original y
datos privados de Illustrator inflaban los PDF. La revisión visual inicial no
añadió hallazgos materiales y abrió 14 capturas de aquella versión. Evidencia
histórica: 3 Node, 6 Playwright (41 s), dos regresiones (24 s), recaptura (26,4 s)
y build (compilación 13,8 s) aprobados. El revisor reejecutó las 3 Node y comparó
bytes de PDF/original con HEX inválido. Los 25 PDF sumaron 272 198 bytes, máximo
15 006; se verificaron trazados en todos y píxeles PDFium idénticos antes/después
en tres casos representativos. La reducción desde aproximadamente 331 MiB fue
histórica y no describe el tamaño final con las nuevas insignias.

No se atribuye clearance al launcher/detector: falló con
`cache_directory_failed` y el contexto existente se leyó directamente. No hay
medición instrumental de contraste/rendimiento, auditoría completa con lector
de pantalla, validación táctil en hardware físico ni prueba en todos los motores.
Las pruebas de navegador usan sesión/APIs simuladas y archivos/descargas reales;
la ampliación de auditoría añade una integración separada real con MongoDB local
aislado, no con datos de producción. El aviso de desarrollo de Next sobre lazy
image/LCP no fue material en las capturas asentadas. La restricción inicial de no
modificar backend/MongoDB es histórica y quedó ampliada por la auditoría autorizada.

### Mantenimiento

La guía local `docs/RECURSOS-INSTITUCIONALES.md` describe estructura, regeneración
y verificaciones. Conservar fuentes, dimensiones reales y procedencia al ampliar
el catálogo. Aplicar siempre las invariantes y comparación con el Hito original
y de la landing de `scripts/resources/HITO-CURACION.md`; cualquier nueva
reconstrucción exige revisión antes de publicarse. Para futuras insignias conservar
el pie vectorial blanco completo con UNT pequeña; volver a comprobar el maestro,
no solo la placa intermedia ni la vista previa. Mantener esta extensión dentro
del lenguaje del panel y conservar README, el sistema público y los flujos QR/enlaces.
Sincronizar los metadatos autorizados de backend al cambiar recursos/variantes y
conservar la exclusión del feed, los permisos de auditoría y la protección del corte.

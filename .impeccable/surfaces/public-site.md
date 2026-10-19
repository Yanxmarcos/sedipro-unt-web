# Sitio público — /, /proyectos, /nosotros, /login

Visitor mode: Read + Experience. Página institucional informativa; las redes
y el correo son sus contactos principales. Referencia fijada: https://www.newformcap.com/.
Los archivos adjuntos son medidas de referencia, no instrucciones sobre la marca.
Implementación a partir de la referencia viva, recursos del repositorio y
documentos institucionales aportados por el usuario. La extensión vigente del 14 de octubre de 2026 es exclusivamente HOME (/):
ProjectJourney añade la parte de Dirección de proyectos/SEDIPRO después de la
portada y ScrollStory originales y antes de Nuestro enfoque. La restauración
corrige la interpretación previa de sustituir el inicio: PublicHero y
#historia/ElasticSection/ScrollStory vuelven a montarse tal como estaban. /nosotros, /proyectos, /login y el panel no
se modifican en este turno; las notas históricas inferiores no amplían el alcance.

## Direction contract
THESIS: una publicación viva sobre dirección de proyectos hecha por estudiantes.
La tipografía y las fotos llevan la historia; desaparece el contenedor de tarjetas
de la landing anterior.

OWN-WORLD: púrpura #662065, índigo #29295d y azul #304d90 institucionales,
tinta violeta oscura, papel claro y lavanda para las acciones. Sans monumental
y serif editorial; estructura plana y líneas finas. El humo previo permanece
en las otras rutas; HOME tiene líquido reactivo dentro de las escenas de color.

STORY (HOME vigente): conocer SEDIPRO UNT, comprender dirección de proyectos,
su red, enfoque, valores, áreas, ejes ODS, PMI e historia. La HOME no contiene
un escaparate de proyectos. Fechas y reconocimientos existentes se conservan;
la información adicional se selecciona de los PDF institucionales autorizados.

FIRST VIEWPORT (vigente): portada institucional aportada por el usuario,
superficie clara, apertura de laterales y contactos reales; conserva el h1
institucional y la animación previa. La portada respira en ciclos de seis
segundos con recorrido de 0.65%, se pausa fuera de vista/documento oculto y
es estática con movimiento reducido. Después aparece ScrollStory con artes
de reconocimientos. Los dos heroes de ProjectJourney son una parte posterior,
no sustituyen este inicio. Hito pequeño permanece.

FORM: mundo editorial New Form existente, con extensión local MindMarket fijada
por el usuario. Dos heroes/papeles, cinta azul de bucle y continuación reversible,
Polaroids de fotografías institucionales y video local, con viento y avión de
trazo fino. Las figuras Hito grandes de la versión previa se sustituyen por
personas reales; no se altera la mascota pequeña. Nuestro enfoque y lo que
sigue conservan sus componentes, movimiento y contenido. No se afirma paridad
exacta de píxeles ni tiempos con ninguna referencia. Movimiento reducido
recupera lectura estática y todos los paneles ODS verticales.

## HOME institucional vigente — actualizado el 14 de octubre de 2026

Orden implementado en `src/app/page.js`: PublicHero; #historia con
ElasticSection y ScrollStory; ProjectJourney con dos capítulos (dirección de
proyectos/perfil de director y definición/red SEDIPRO); enfoque; valores;
cinco áreas; ejes ODS; explicación del PMI; hitos; bandas finales; footer.
PublicHero y ScrollStory recuperan exactamente su montaje anterior. La portada
contiene el único h1; Dirección de proyectos usa h2 sin cambio visual. La red
identifica UNT, UPN y UCV en Trujillo y atribuye «Más de 30» universidades al
brochure de 2024.

El enfoque tiene 380svh en escritorio y 300svh en móvil, escenario de 100svh.
Los círculos académico, social y ambiental se trasladan hasta el centro; aparece
«Formación integral»; se separan con «Formación académica», «Compromiso social»
y «Conciencia ambiental»; el diagrama completo escala a 5.8 alrededor de su
intersección (origen 50% 44%). La copia se desvanece durante ese zoom. El relleno
central #8b4c99 sostiene el contraste de cabecera. No se escalan individualmente
los círculos. Los valores tienen 220svh / 180svh y destacan Integridad, Trabajo
en equipo, Innovación, Vocación de servicio y Actitud positiva.

Las áreas GTH, PMO, TI, MKT y LTK & FNZ usan tabs interactivos, panel asociado,
foco rotatorio y navegación con flechas, Home y End. Se mantienen sus emblemas
y el enlace existente al área TI. Los ejes muestran quince ODS: 1, 2, 3, 4, 5,
7, 8, 9, 10, 11, 13, 14, 15, 16 y 17. La introducción usa el recorte general y
los otros tres paneles agrupan cinco objetivos cada uno. ResizeObserver mide
el ancho y recorrido del track; en escritorio la altura es recorrido + 100svh
y el scroll vertical mueve el track horizontal. En móvil hay swipe nativo,
snap y cuatro controles de 44px. Con movimiento reducido todos los paneles
aparecen en vertical y desaparecen los controles de progresión.

PMI se desarrolla como Project Management Institute; CAPM se expande como
Certified Associate in Project Management. Su fotografía corresponde al
encuentro de Lima, 2023 y conserva esa leyenda histórica. Los hitos son la
fundación del 30 de agosto de 2013, primer lugar IPMC 2021, primer lugar
CONCEPMI 2023 y tercer puesto IPMC Perú 2025. Las bandas y el footer se conservan;
el footer incorpora un marco SectionLiquid y enlaces de navegación existentes.

SectionLiquid se monta en historia, enfoque, valores, áreas, PMI y footer.
Solo activa LiquidEther con escena próxima (margen 200px), documento visible,
hover/puntero fino y movimiento permitido: autoDemo=false, sin PageBackdrop
ni luz superior. El mismo canvas se extiende 160px sobre cada escena (100px
móvil), con máscara inversa que sigue el separador. Los separadores conservan
dos segmentos cúbicos de extremos planos, respuesta tanh y resorte amortiguado,
máximo central 72px / 45px y solape para evitar costuras; con movimiento reducido
son planos. ProjectJourney y la portada vigente no montan shader.

Inter Tight es la aproximación disponible de TWK Lausanne; la fuente original
no se distribuye ni se afirma equivalencia. Los titulares institucionales usan
550, line-height 1.04 y tracking -0.025em en las secciones posteriores;
ProjectJourney usa Inter Tight 500 según su sección siguiente.
Manrope y la serif editorial continúan en sus roles existentes.

## Extensión vigente: ProjectJourney con colaje — 14 de octubre de 2026

Esta extensión ocupa su lugar después de PublicHero y ScrollStory y antes
de HomeApproach. La restauración conserva el inicio aprobado; solo añade la
parte de Dirección de proyectos/SEDIPRO. Sustituye el journey previo de cuatro
Hito grandes por el colaje actual. Su fuente es
`src/components/public-site/project-journey.jsx` y su CSS module; la integración
es `src/app/page.js`. HomeApproach y todas las secciones siguientes conservan
su implementación, incluido el separador azul desde papel #f6f1fa. Solo cambia
la semántica del primer titular del journey de h1 a h2; sus visuales, fotos,
video y cinta permanecen iguales.

Cada capítulo tiene hero sticky de 100svh y hoja en flujo, que asciende sobre
su título: primero índigo #29295d, después púrpura #662065. La hoja es #f6f1fa,
con esquinas superiores de 52px (30px móvil). El título usa Inter Tight 500,
clamp(64px, 10.8vw, 156px), .98 y -.04em; móvil clamp(48px, 12vw, 86px).
El lienzo máximo es 1440px, padding 140px 5% 220px y mínimo
calc(min(100vw, 1440px) * 1.9). La introducción usa columnas 43% / 53% y gap
4%; su copia tiene respaldo de papel que la protege de la cinta. Los paneles
inferiores blancos son de 49%, padding 40px y radio 16px. Entre 768–1000px
el lienzo usa 4% lateral, mínimo 2350px, columnas 47% / 49% y panel 55%.
Móvil tiene altura natural, padding 50px 24px 130px, fotos antes de la copia
y paneles completos. Los titulares principales de lectura usan
clamp(38px, 4.4vw, 64px), los inferiores clamp(36px, 3.7vw, 53px), ambos
500/1.03/-.035em; móvil clamp(34px, 9vw, 49px). El cuerpo usa Manrope,
clamp(17px, 1.55vw, 21px)/1.55; móvil 17px.

La ruta SVG azul #304d90 empieza prácticamente como punto. Cada hoja mide su
scroll entre `start end` y `end end`, remapeando [0,.12,.35,.6,1] a
[.0001,.005,.12,.65,1]. El grosor crece durante [0,.28], de 44 a 500 unidades
desktop y de 24 a 135 móvil. El primer capítulo usa el bucle cúbico y su
pasada sombreada azul/índigo/azul; el segundo usa la continuación. Desktop
emplea viewBoxes 0 190 1944.2 3378 y 0 2450 1944.2 3701.5, móvil 0 40 400 1960.
El dibujo se revierte al subir. No se afirma reproducción exacta de cada
frame, métrica o tiempo de MindMarket.

El colaje usa Polaroids de marco blanco recto, leyenda y sombra
0 16px 32px rgb(27 16 45 / .16), con rotaciones completas. El JPG local de
reunión general (5712×4284, 4:3) se copia sin modificar y se muestra completo
con Next Image. CONCEPMI e IPMC conservan el raster original y muestran solo
la región fotográfica por CSS, respectivamente [122,248,620,317] y
[210,286,650,385]. La gala 1080×1350 procede de
https://www.instagram.com/p/Dc2HcAxlfJX/?img_index=3, descargada mediante navegador
sin alterar sus píxeles; la ventana CSS es [92,581,449,586]. Las leyendas
CONCEPMI/IPMC conservan 2025. La leyenda de gala reproduce 2026 de la fuente
actual; la procedencia no afirma fecha de captura ni licencia original.

El MOV local de reunión se conserva completo: duración de fuente 6.435s,
MP4 H.264/AAC 1280×720 faststart, 1,997,206 bytes y duración de contenedor
6.453s. El póster se extrae en el segundo 1. Usa controles nativos, muted,
playsInline, preload none, sin autoplay; se pausa fuera de vista y al ocultar
el documento. Las procedencias exactas están en ../assets-provenance.json.
Los detalles de viento son SVG geométricos propios y el avión es Lucide Send;
la inspiración Hairline no incorpora un runtime externo. El colaje se mueve
0/-45/-65px por scroll; los detalles tienen traslación/rotación leves.

La cabecera sigue fija y transparente. Papel tiene prioridad sobre el stroke
visible para decidir por separado color de logo, menú y barras. El hit testing
respeta el dash dibujado y omite capas transparentes. La corrección de contraste
adicional compara el rectángulo completo de cada control contra marcos
`data-nav-media`; mientras intersectan, solo el control afectado usa respaldo
#141020 con inset -8px y radio 8px, y contenido blanco. Desaparece al salir del
marco. No añade fondo a toda la barra. Su fuente es navigation.jsx y
public-site.module.css.

Con movimiento reducido, los heroes son relativos y mínimo 75svh, las rutas
aparecen completas y el colaje/detalles no tienen parallax. Esta alternativa
se constata en fuente; no se emuló visualmente. La mascota pequeña Hito y sus
recursos/marcha permanecen intactos. Los Hito grandes anteriores quedan en
el repositorio; no se montan en este colaje.

Estado de cierre: `../review/collage-finish-review.md` emitió `disposition:
ship` tras resolver el único hallazgo material puntuado, contraste de
navegación sobre fotografías. Los diez archivos collage-*.png se recapturaron
en los mismos paths y son válidos. El reviewer no observó regresiones
introducidas por la corrección en esas capturas; el veredicto cubre solo el
arreglo de navegación puntuado, no toda la superficie. No transfiere a esta
versión el ship histórico de journey-finish-review.md.

El builder informó build final de 12.6s, ESLint y diff check con exit 0,
console errors vacío y ausencia de overflow raíz móvil. Observó el respaldo
activo en menú desktop y marca móvil. Verificó reversibilidad al subir:
la longitud del segundo path pasó de .736842 a .609353. La reproducción manual
del video alcanzó readyState 4, duración 6.453, currentTime 5.697, paused false
y muted true; el código de pausa fuera de vista/ocultamiento se inspeccionó
en fuente, sin afirmar un resultado de ese control que no esté registrado.
Este documenter leyó el veredicto y fuente, sin repetir el build ni los
controles de navegador. Movimiento reducido tiene respaldo de fuente, sin
emulación visual; no se certifica cada frame ni paridad exacta con referencia.
No se reejecutó launcher/detector Windows; el fallo previo
cache_directory_failed no es un resultado del detector. Las otras rutas y
cambios previos ajenos permanecen fuera del alcance.

## Restauración del inicio — 14 de octubre de 2026

El usuario confirmó conservar el inicio anterior y añadir únicamente la parte
ProjectJourney en su posición posterior a ScrollStory. El builder informó
build de 10.4s y ESLint correctos, orden DOM portada/historia/journey/enfoque,
un solo h1 en portada y ausencia de overflow raíz móvil. Las posiciones móviles
medidas fueron portada 0, historia 811 y journey 3225. Evidencia visual válida:
restored-home-desktop.png, restored-history-desktop.png,
restored-journey-desktop.png, restored-home-mobile.png y
restored-journey-mobile.png en ../review/. La revisión independiente en `../review/restored-home-review.md` emitió
`disposition: ship` solo para restauración y orden: cinco capturas válidas y
sin defectos materiales observados. No amplía el ship del arreglo de cabecera
previo ni certifica toda HOME.

## Historial: ProjectJourney con Hito grandes — 14 de octubre de 2026

Registro superado por la extensión con colaje anterior. No describe el montaje actual.

Sustituye únicamente `ProjectDirection` y `SediproNetwork` entre ScrollStory
y Nuestro enfoque, mediante `src/components/public-site/project-journey.jsx`
y su CSS module. Los exports y estilos obsoletos de esas dos secciones se
retiraron de home-institutional; la función y CSS de HomeApproach se conservan.
Su separador recibe ahora `#f6f1fa` como superficie anterior. No se modifica la
portada HOME ni el comportamiento de la mascota Hito.

THESIS: la cinta continua enlaza el concepto de dirección de proyectos, las
personas que los dirigen, una SEDIPRO y su comunidad universitaria. OWN-WORLD:
campo `#f6f1fa`, cinta `#304d90`, paneles blancos, texto `#29295d`, acciones
`#662065`, Inter Tight/Manrope existentes e Hito transparente original.
STORY: apertura «Dirección de proyectos.» y paneles derecha/izquierda/centro/
derecha, acompañados de `/img/hito4.webp`, `hito5.webp`, `hito2.webp` y
`hito6.webp`. La red mantiene UNT, UPN y UCV en Trujillo y atribuye
explícitamente la cifra de más de 30 universidades al brochure de 2024.
Las acciones usan anclas nativas entre capítulos y terminan en `/nosotros`.
FIRST VIEWPORT aquí significa apertura de la sección, no un nuevo hero HOME.

FORM: el usuario fijó la composición y animación de MindMarket «tal cual».
La implementación desktop usa los datos cúbicos de su cinta viva: bucle que
regresa, tramo de gradiente y continuación sobre el cruce, en el viewBox
`0 0 1944.2 6151.5`, con stroke 500 y remates redondos. El gradiente combina
azul/índigo/azul existentes (stops 0/.3/.8; coordenadas 1730,2090 a 620,3320).
Las tres pasadas dibujan en secuencia: el bucle termina en progreso .562932,
el sombreado cubre .209622–.430772 y la continuación sigue al bucle, según
proporciones numéricas de longitud cúbica. Una compuerta de opacidad al inicio
de las últimas dos pasadas evita puntos prematuros. El progreso de Motion
sigue el scroll de sección de `start 65%` a `end 65%` en ambos sentidos.
En desktop, los stops de scroll `[0, .22, .37, .55, .82, 1]` se remapean a
progreso de dibujo `[.001, .21, .43, .72, .9, 1]` para completar el cruce
mientras el panel central permanece visible. El móvil conserva progreso lineal.
La adaptación institucional no certifica equivalencia exacta de píxeles o tiempos.

El lienzo desktop limita su ancho a 1440px, padding `100px 24px 120px`
(30px laterales desde 1440px), altura mínima
`calc(min(100vw, 1440px) * 3.29 + 340px)` y ruta desde 340px. La retícula tiene
doce columnas y gap de 24px. Los paneles ocupan `8 / 13`, `1 / 6`, `5 / 10`
y `8 / 13`; entre 768px y 1000px se amplían a `7 / 13`, `1 / 7`, `4 / 11`
y `7 / 13`. Son blancos, planos, de radio 16px y padding
`clamp(28px, 3vw, 44px)`; no son la antigua escena de color de red SEDIPRO.
El titular de apertura usa Inter Tight 500, `clamp(64px, 9.5vw, 136px)`,
line-height .98 y tracking -.04em. Los paneles usan Inter Tight 500,
`clamp(34px, 3.6vw, 53px)`, line-height 1.08 y tracking -.03em; el cuerpo,
Manrope `clamp(17px, 1.55vw, 21px)`, line-height 1.5, tracking -.015em y 52ch.

Hasta 767px, el lienzo tiene altura natural y padding `65px 24px 85px`.
Cada figura precede a su panel, con ancho máximo de 300px; la curva vertical
móvil propia usa viewBox `0 0 400 3400`, stroke 145 y comienza a 200px.
La apertura usa `clamp(48px, 12vw, 82px)`; los paneles,
`clamp(30px, 8vw, 43px)`, padding `28px 24px` y cuerpo 17px.
Los anchos de stroke son unidades del viewBox, no píxeles CSS.

Los Hito conservan el raster completo y proporcional mediante `object-fit:
contain`; solo la figura completa se traslada de 32 a -32px y rota de -3 a 3
grados según su scroll local. No hay partes reconstruidas, máscaras ni nuevos
píxeles. Con movimiento reducido, el código muestra la cinta completa —con
las tres capas y gradiente desktop, o la curva móvil— y Hito estático. El texto
permanece visible. Las acciones púrpuras tienen altura mínima de 60px, radio
12px, círculo blanco de 36px y foco púrpura de 3px con separación de 6px.

La cabecera continúa transparente. Solo dentro de la nueva superficie mixta,
`navigation.jsx` muestrea separadamente el centro del logo, del disparador y
de las barras de menú;
los paneles de papel tienen prioridad y los strokes SVG visibles determinan
blanco sobre cinta o tinta sobre campo/panel. Para rutas parciales, Path2D y
un contexto 2D sin dibujar prueban solo el dash ya visible, con longitud
geométrica cacheada; las rutas completas usan el hit test SVG nativo y las
capas de opacidad cero se omiten. Así, la continuación todavía sin dibujar
no vuelve blancos los controles sobre papel. Fuera del journey se restauran
las reglas existentes. ProjectJourney no monta SectionLiquid.

La procedencia de Hito ya está registrada y no cambia. No se incorpora el arte
humano, copy comercial ni código externo de MindMarket. No se requiere seed
de concepto ni comp aprobada: el usuario fijó referencia y mundo local.
La primera revisión pidió corregir bucle/cruce, profundidad y documentos;
la revisión final resolvió los tres puntos y emitió ship acotado, con posterior
confirmación de legibilidad de la navegación tras su corrección de hit testing.
La alternativa de movimiento reducido tiene evidencia de fuente, sin emulación
visual. El fallo previo del launcher/detector Windows no se volvió a ejecutar;
no existe resultado del detector. No se afirma cobertura visual de toda HOME.

Fuentes aportadas: C:/Users/Marcos/Documents/Proyectos/SEDIPRO/BROUCHURE SEDIPRO
2024.pdf y BIENVENIDA SEDIPRANA EXTRAORDINARIA 2026.pdf (solo definición PMI de
este último). El recorte general y quince iconos ODS proceden de la página 11
del brochure; la foto histórica del PMI, de la página 10. Los diecisiete recursos
adicionales están inventariados en ../assets-provenance.json; no son imágenes
generadas y no se afirma licencia original. No se importaron directivas,
proyectos ni contactos antiguos. Referencias de verdad externa:
https://www.un.org/sustainabledevelopment/es/sustainable-development-goals/
y https://www.pmi.org/certifications/certified-associate-capm.

## ScrollStory vigente — reconocimientos, 13 de octubre de 2026

El alcance de este refinamiento es únicamente ScrollStory de `/`. Se mantienen
las tres etapas de escritura/borrado y entrada lateral de imágenes, el escenario
sticky de 100svh, la altura de 320svh / 280svh, SectionLiquid y Hito. Debajo
del relato permanece solo «Conoce a SEDIPRO UNT», hacia `/nosotros`.

Los artes originales proceden de los tres posts aportados por el usuario:
Voluntariado Universitario 2024 (`DD-NlilPET9`, 1080×1080), CONCEPMI 2025
(`DRVluTljUpT`, 864×1080) e IPMC 2025 (`DVj7gglk3OH`, 1080×1350).
El post de IPMC publicado en marzo de 2026 documenta el evento de 2025.
Los archivos de `public/img/institutional/recognitions` se conservan sin edición
de píxeles, con procedencia en `../assets-provenance.json`; no se afirma autoría
ni licencia original. `object-fit: contain` muestra cada arte completo y a color,
sin recorte, escala de grises, scrim superpuesto ni esquinas redondeadas.

En escritorio el marco usa `left: 5%`, `width: 32%`, `top: 12svh` y
`height: 72svh`. El titular ocupa el espacio entre `left: 42%` y `right: 4%`,
desde `top: 35svh`, con `clamp(40px, 6.05vw, 96px)`. Los porcentajes se calculan
sobre el escenario; su límite de 1600px a partir de 1700px conserva esta relación.
Hasta 767px, el arte pasa a márgenes laterales de 24px, `top: 10svh` y
`height: 42svh`; el texto usa esos márgenes, `top: 57svh` y
`clamp(26px, 8.25vw, 43px)`. Continúan peso 550, line-height 1.1 y tracking
-0.02em. El ajuste solo amplía el uso de la columna y apila el arte y el texto
en móvil; no cambia las frases ni los tiempos del relato.

Con movimiento reducido, el código muestra el primer titular y primer arte en
lectura estática junto al enlace, recupera altura natural y reinicia posiciones
laterales a `auto`. Esta alternativa tiene respaldo de fuente; no se afirma
una comprobación visual emulada.

## Historial: ajuste del relato y separadores — 12 de octubre de 2026
El relato de / ahora mantiene una escena fija en escritorio y móvil. Tres
fotografías entran desde los laterales y acompañan texto que se escribe y borra
por líneas. Se usa Inter Tight 550 como aproximación disponible de TWK Lausanne,
sin afirmar que sea la fuente original. El contenido sigue siendo institucional.
Los separadores de las secciones de / se curvan según velocidad y sentido del
scroll y vuelven a quedar rectos al detenerse. Con movimiento reducido son planos
y la historia recupera una presentación estática. Se conservaron portada, Hito,
nav transparente y shader global desactivado en /. Compilación y lint aprobados; se
observaron curvas de signo opuesto, las tres etapas y la adaptación móvil.

Refinamiento posterior: extremos planos y dos segmentos cúbicos, con deformación
central proporcional a la velocidad mediante tanh y retorno amortiguado. El relleno
solapa la unión para suprimir la costura de antialiasing. La historia monta solo
LiquidEther interactivo con autoDemo false, sin PageBackdrop ni luz superior;
la portada permanece sin shader. La unión se inspeccionó en escritorio y móvil,
con un canvas líquido dentro de la historia y ninguno en el fondo global de /.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Historial: finish review de las cuatro rutas
Disposition: ship. La revisión independiente confirmó las correcciones del titular
y su encaje en el viewport, el saludo diferido de Hito, el contraste inicial del
texto por scroll y las claves distintas del contenedor y de la mascota.
El veredicto cubre esos ajustes; no certifica equivalencia exacta de los tiempos
con la referencia. Se revisaron las cuatro rutas en escritorio y móvil.
La compilación pasó, el lint de los componentes nuevos pasó y las doce pruebas
de temporización de Hito pasaron. El detector de Impeccable no pudo iniciarse
por un fallo del launcher de Windows; se usaron código y capturas para la revisión.

## Historial: finish review HOME — 12 de octubre de 2026

Disposition: ship, según ../review/home-finish-review.md. El veredicto cubre
el código HOME y siete escenas suministradas: institutional-focus-desktop.png,
institutional-focus-zoom-desktop.png, institutional-ods-desktop.png,
institutional-areas-desktop.png, institutional-pmi-desktop.png,
institutional-focus-mobile.png e institutional-ods-mobile.png. La captura de
áreas corresponde a un estado ya desplazado, con el título pasando bajo la
navegación fija. La captura móvil ODS cubre la introducción, no los grupos posteriores.

El builder reportó build de producción, ESLint dirigido y git diff --check
aprobados; ArrowRight de TI a Marketing, controles ODS escritorio/móvil,
console errors [] y ausencia de overflow raíz. El reviewer inspeccionó código
y las siete imágenes, sin repetir esas pruebas. El viewport informado fue
1280×720 escritorio y 390×844 móvil; los PNG guardados son 1265×712 y 375×812
respectivamente, sin equiparar píxeles guardados a viewport CSS.

No hubo captura full-page disponible. Portada, definición/red, valores, hitos
y cierre tienen respaldo de código pero no veredicto visual actual. Movimiento
reducido y condiciones del shader se verificaron en fuente, sin emulación
visual. Respuesta dinámica al mouse, todos los empalmes en movimiento, estados
intermedios del enfoque y secciones móviles no capturadas quedan fuera de
evidencia visual directa. No se certifica toda la página, accesibilidad universal
ni paridad exacta con New Form. El launcher y detector de Windows fallaron
previamente (cache_directory_failed); no hay resultado del detector y no se
volvieron a ejecutar.

## Historial: finish review ScrollStory — 13 de octubre de 2026

Disposition: ship, según `../review/recognitions-finish-review.md`. El veredicto
cubre únicamente el refinamiento solicitado y la corrección del encaje del
titular en escritorio ancho. Los offsets porcentuales siguen el escenario de
1600px; la revisión confirmó que se resolvió la discrepancia anterior con `vw`.

Las recapturas finales son `recognitions-desktop.png`, `recognitions-mobile.png`
y `recognitions-wide.png`. Los viewports CSS informados fueron 1280×720,
390×844 y 2560×1080; los PNG medidos son 1265×712, 375×812 y 1893×1074.
No se equiparan dimensiones guardadas y viewport. La captura ancha muestra
los tres renglones de la tercera etapa y el arte IPMC completo, sin obstrucción.
La móvil muestra el arte CONCEPMI completo y el titular de renglón más largo.
En escritorio estándar aparecen todos los renglones; la burbuja temporal de
Hito se superpone a una esquina inferior del arte. La captura ancha respalda
la inspección visual del arte completo. El primer arte tiene evidencia de
fuente y del informe del builder, sin captura final dedicada.

El builder reportó compilación de producción y lint aprobados, columna de
titular de 864px en el escenario ancho, `clientWidth` igual a `scrollWidth`
en sus renglones y ausencia de overflow raíz, también en móvil. El reviewer
inspeccionó la fuente y las recapturas; no repitió esos controles.
La revisión no certifica toda HOME, cada frame de animación, movimiento
reducido emulado visualmente ni paridad exacta con New Form. No se volvió
a ejecutar el detector.


## Historial: finish review ProjectJourney con Hito grandes — 14 de octubre de 2026

Disposition: ship, según `../review/journey-finish-review.md`. Los tres puntos
puntuados quedaron resueltos: bucle y autocruce derivados de la referencia viva,
profundidad del cruce con movimiento coordinado y persistencia de documentación.
La confirmación posterior releyó fuente y centro recapturado tras corregir el
hit test del tramo pintado: conserva el cruce/panel y muestra «Menú» blanco
sobre azul y barras oscuras sobre el campo claro. El veredicto cubre estos fixes
acotados y esa confirmación de legibilidad, no toda HOME.

Las capturas finales son `journey-opening-final.png`, `journey-center-final.png`
y `journey-mobile-final.png`. Los PNG desktop miden 1265×712 y el móvil 375×812;
no se equiparan esas dimensiones guardadas a viewport CSS. La apertura muestra
el titular de dos líneas completo, la cinta emergente y el inicio del primer
panel; no muestra ese panel entero. El centro refrescado muestra el panel
SEDIPRO completo, Hito original y separación de pasadas azul/índigo. La móvil
muestra el panel y acción completos; parte de Hito queda por encima del viewport
de captura, sin modificar su raster. El cuarto panel tiene respaldo de fuente,
sin captura final dedicada. Ninguna es full-page.

El builder reportó build de producción y ESLint dirigido finales aprobados,
console errors [], ausencia de overflow raíz desktop/móvil y reversibilidad:
el progreso de la pasada frontal bajó de .347987 a .056706 al subir y se
restauró al bajar. También confirmó los colores computados de etiqueta y barras
en el centro recapturado. El reviewer inspeccionó fuente y capturas sin repetir
esos controles. Este documenter leyó el veredicto actualizado e inspeccionó las
tres capturas finales, incluido el centro refrescado.

Movimiento reducido tiene respaldo de fuente, sin emulación visual. No se
certifica cada frame de animación, paridad exacta de píxeles o tiempos con
MindMarket, accesibilidad universal ni toda HOME. No se volvió a ejecutar el
launcher/detector de Windows; no existe resultado del detector. Los registros
previos de HOME y ScrollStory conservan su alcance histórico propio.

## Extensión local: portfolio de /proyectos — 16 de octubre de 2026

La ruta abre con navegación y «Nuestros proyectos.» sobre azul institucional,
sin fotografía hero. El scroll revela una cortina curva de derecha a izquierda
y después recorre verticalmente seis filas sobre índigo. Conserva posters
completos pequeños, descripciones, fechas y enlaces existentes; los campos ISO
ordenan la copia del catálogo de más reciente a más antiguo, con CROWN NIGHT
2026 primero. El contorno responde elásticamente al mouse sin deformar la
copia. El índice permite saltar entre proyectos y el foco de una fila la revela.
En móvil se mantiene la entrada horizontal, con flecha compacta y filas apiladas.
Sin JavaScript o con movimiento reducido, hero y lista quedan en flujo normal.
PublicShell omite el shader únicamente para esta ruta además de la excepción
HOME existente; las demás rutas conservan su tratamiento.

La comparación con DESIGN.md confirma reutilización de azul, índigo, papel y
lavanda, tipografía pública y posters con proporción conservada. El nuevo
portfolio es una composición local; no modifica los tokens ni aprueba cambios
duraderos del sistema. PRODUCT.md mantiene la autoridad sobre contenido,
enlaces, identidad y acceso por teclado. DESIGN.md, design.json y PRODUCT.md
no se actualizaron: permanecen sus notas históricas y desajustes previos,
incluidas las descripciones antiguas de subpáginas con fotografía y humo.
Esta nota registra la excepción vigente de /proyectos sin reparar esa deriva.

Disposition informada por el reviewer: ship, sin hallazgos materiales. Este
documenter comparó la fuente de ProjectPortfolio, sus estilos, la página,
PublicShell y el catálogo con DESIGN.md y PRODUCT.md, e inspeccionó las cuatro
capturas de `../review/`: `projects-desktop-hero.png`, `projects-desktop.png`,
`projects-mobile-hero.png` y `projects-mobile.png`. Muestran la apertura y las
primeras filas en ambos tamaños; no son capturas completas del catálogo ni
demuestran cada frame del movimiento o la respuesta al mouse. El lint dirigido
fue informado como aprobado. El launcher del detector falló con
`cache_directory_failed`; no existe resultado del detector. El flujo reducido,
el foco y los saltos de índice tienen respaldo de fuente, sin prueba de navegador
adicional de este documenter. No se certifica paridad exacta con New Form ni
se extiende este veredicto a HOME u otras rutas.

## Extensión local: recorrido de /nosotros — 16 de octubre de 2026

La ruta monta AboutExperience y PublicFooter. La referencia fijada por el usuario
es el recorrido principal de la HOME de GSAP: bajar, desplazarse a la izquierda
y continuar bajando. Se adapta a SEDIPRO mediante scroll nativo reversible, con
dos escenas horizontales desde 900px: esencia (quiénes somos, misión y visión)
y las siete personas de la directiva 2026. Móvil, movimiento reducido y ausencia
de JavaScript conservan el contenido en flujo vertical. El resto desarrolla
cinco áreas, cinco cifras de impacto, experiencia de más de 12 años y más de
13 años proyectando vidas, alianzas y networking, catorce reconocimientos en
seis años, video original y cierre «Proyectando vidas. Construyendo futuro.».
Se conserva el enlace al área TI, el footer y los emblemas de las áreas.

Las piezas de las áreas recuperan Matter.js: arrastrar y lanzar con el puntero,
«Lanzar todos», «Reiniciar» y lanzamiento de una pieza con Enter. Los cuerpos
físicos toman el tamaño real de la pieza en el DOM para coincidir con sus
límites visibles también en anchos intermedios. El foco de esta sección clara
usa púrpura institucional. Con movimiento reducido las piezas permanecen
estáticas. La nueva figura geométrica de cuatro aspas es SVG propio; el avión
dorado reutiliza el recurso existente.

La comparación de fuente y documentación confirma el azul, índigo, púrpura,
papel y lavanda existentes, Manrope para lectura e Inter Tight para titulares.
Las composiciones, medidas y tonos auxiliares son decisiones locales de esta
ruta, sin aprobación de una identidad nueva. Por indicación posterior del
usuario, PUBLIC_SHADERS_ENABLED=false desactiva humo y líquido en PublicShell,
SectionLiquid y LandingOnly; sus implementaciones y dependencias permanecen.
Esta decisión sustituye las descripciones históricas de shader activo en este
documento. DESIGN.md, .impeccable/design.json y PRODUCT.md se conservan sin
modificar: sus notas previas de humo, líquido y subpáginas registran deriva
documental; esta nota no las convierte en decisiones nuevas del sistema.

El reviewer informó disposición ship tras resolver los dos hallazgos acotados:
contraste del foco y correspondencia entre cuerpos físicos y piezas visibles.
El builder informó lint dirigido aprobado, ausencia de overflow en escritorio
y 390/560/580px, siete retratos y catorce reconocimientos, detalle 2024 abierto,
scroll horizontal reversible y pruebas de arrastre, lanzamiento y Enter.
La evidencia visual registrada en ../review/ comprende about-desktop-hero.png,
about-desktop-story.png, about-desktop-mission.png, about-desktop-team.png,
about-desktop-game.png, about-mobile-hero.png, about-mobile-game.png,
about-560-focus.png y about-580-focus.png. Este documenter comparó DESIGN.md,
PRODUCT.md, el sidecar, la ruta, AboutExperience, sus estilos, AboutPlayground
y las compuertas de efectos; no repitió el navegador ni el lint ni inspeccionó
visualmente esas capturas. El launcher del detector había fallado con
cache_directory_failed y no se reejecutó; no existe resultado del detector.
El veredicto no certifica cada frame, paridad exacta con GSAP ni otras rutas.

Actualización puntual: por solicitud del usuario se retiró de /nosotros la sección «Un poco de nosotros.» con su video. Reconocimientos enlaza ahora directamente con el cierre de Proyectando vidas; el archivo de video compartido permanece en el proyecto.

## Extensión local: menú público — 18 de octubre de 2026

El menú conserva el fondo tinta `#141020`, texto papel `#f6f1fa`, acción lavanda
`#e2bcf1`, Manrope y filas separadas por líneas finas del sistema público.
Por solicitud del usuario, Inicio, Proyectos, Nosotros y Acceso sediprano son
cuatro rutas de igual jerarquía, tamaño y tratamiento. El acceso enlaza a
`/login`. Los cinco contactos sociales existentes llevan sus iconos de marca;
el correo reutiliza CopyEmail y su tooltip, junto al enlace mailto existente.
No se crea una nueva identidad, un nuevo sistema de componentes ni recursos
raster. Esta excepción local sustituye la descripción histórica del acceso
secundario dentro del menú; PRODUCT.md, DESIGN.md y el sidecar se conservan.

PublicNavigation usa las fases closed/opening/open/closing y un clip SVG con
dos curvas cúbicas: la apertura revela el menú de derecha a izquierda y la
salida lo retira hacia la izquierda. El borde se deforma durante el recorrido;
los tiempos locales son .68s y .48s. El diálogo nativo permanece modal y el
body bloqueado hasta terminar la salida; Cerrar y Escape pasan por esa fase.
Con movimiento reducido la duración es cero y se omite el clip. Las filas
comparten una escala sensible al ancho y alto; en móvil tienen un mínimo de
66px, contactos en tres columnas y scroll vertical nativo si falta altura.
Los dos guards de refs en ProjectJourney/placeOrigin y SocialShowcase/fitPhone
evitan callbacks de ResizeObserver sobre refs desmontadas al navegar.

Disposition: ship para este refinamiento acotado. El reviewer inspeccionó
primero las dos referencias del usuario y las capturas finales
`../review/menu-sweep-desktop.png` (1440×900) y
`../review/menu-sweep-mobile.png` (390×844), y después fuente y documentación.
Las capturas muestran las cuatro rutas con igual jerarquía, correo y cinco
redes completos. La referencia de curva guía la geometría, sin exigir su
paleta, contenido ni equivalencia exacta de píxeles o tiempos.

El builder informó ausencia de overflow en 390×844 y 320×568, y scroll vertical
nativo sin overflow horizontal en 760×430; igualdad de tamaño entre las cuatro
rutas, navegación a /login, reapertura, Cerrar y Escape con restauración de
overflow y foco en Menú. El clic de copia mostró «Copiado» y el handler de
clipboard terminó correctamente; una lectura independiente del portapapeles
no confirmó el contenido, por lo que no se afirma un roundtrip exacto. El lint
dirigido de los tres JSX y git diff --check fueron informados como aprobados.
Tras los guards no se observaron errores nuevos al repetir la navegación.

La dirección y deformación del barrido tienen respaldo de fuente y muestreo
de fase/path durante el cierre; no hay captura visual de su punto intermedio.
`menu-sweep-exit.png` muestra el inicio todavía completo y no prueba ese punto.
Movimiento reducido y touch físico no se emularon visualmente. No se afirma
una prueba completa de wrap de foco: se usa la modalidad nativa del diálogo,
con restauración verificada al cerrar. El launcher/detector había fallado con
`cache_directory_failed`; no se reejecutó y no existe resultado del detector.
El veredicto no certifica toda HOME, las otras rutas ni cada frame de animación.

## Extensión local: acceso con Hito — 18 de octubre de 2026

Por solicitud del usuario, la cabecera pública conserva solamente el logotipo
y Menú; se retira su enlace adicional «Acceso sediprano». La ruta /login sigue
disponible como cuarta fila del menú. Los tiempos vigentes del barrido son
1.1s de apertura y .9s de cierre, sustituyendo los .68s/.48s de la nota anterior.

El acceso usa fondo #f6f1fa y un formulario centrado con el lenguaje existente
de bordes negros gruesos, esquinas rectas y sombras duras, expresamente fijado
por el usuario. Conserva «Iniciar sesión», Usuario, Contraseña e Ingresar; retira
del formulario el logotipo/nombre SEDIPRO UNT, la descripción y el aviso de
exclusividad. El logotipo institucional permanece en la cabecera. Son cambios
locales de esta superficie Operate; no establecen reglas nuevas para otras rutas.

Hito aparece grande detrás del borde superior, con cabeza y manos/alas, sin
cuerpo ni pies; queda una franja mínima del cuello azul del original. La cabeza
se muestrea de public/img/hito3.webp, cuyo archivo no se modifica. Las manos
proceden del recurso original scripts/hito-source/rig-v4.png, copiado sin cambios
a public/img/institutional/login/hito-rig.png; SHA256
5A4ABEA41894B3EDD5D1F655D171FA608DD2057D1079E6BBC7BAC867BB20E9EB.
No se produce una ilustración raster nueva ni una sustitución SVG. Canvas
conserva el rostro y las pupilas texturadas originales; desplaza las pupilas
dentro del blanco ocular para seguir el mouse. Las manos cubren los ojos al
enfocar el grupo de contraseña, también al mostrar su texto. Al salir del grupo
regresan al borde. El render usa requestAnimationFrame por demanda, limpia
listeners y pausa en pestaña oculta; movimiento reducido fija la mirada y
aplica la cobertura sin transición.

La sustitución está en LoginAccess/LoginHito y su CSS module, conectada solo
a la rama admin de Login y a /login. La inspección y comparación de fuente
informadas por el builder mantienen handler, endpoints, cuerpos de petición,
sesión y redirecciones existentes; encargado y facilitador conservan sus ramas.
No se probaron credenciales, red ni sesión real.

Disposition: ship para este alcance. El reviewer inspeccionó primero las dos
referencias panda aportadas por el usuario, Hito original y las cinco capturas
finales de ../review/: login-hito-desktop.png, login-hito-look-left.png,
login-hito-covered-desktop.png, login-hito-mobile.png y
login-hito-covered-mobile.png; después contrastó fuente y contexto existente.
Las capturas desktop miden 1440×900 y las móviles 390×844. Muestran formulario
completo, cabeza original, manos en reposo/cobertura y la cabecera simplificada.
Las referencias fijan la relación cabeza/manos/formulario y el gesto, adaptados
a Hito y al estilo de formulario que el usuario pidió conservar.

El builder informó centrado desktop, encaje completo en 390×844 y scroll
vertical natural con altura de documento 633px en 320×568, sin overflow
horizontal. Informó campos de 48px, control ocular de 44px, cobertura al enfocar
contraseña y al alternar visibilidad, retorno al enfocar Usuario y validación
nativa de envío vacío que enfoca Usuario sin enviar petición. La comparación
de regiones oculares izquierda/derecha informó 4548 píxeles cambiados. También
informó ESLint dirigido de cinco JSX y git diff --check aprobados, consola sin
errores y fondo computado rgb(246, 241, 250). El reviewer no repitió esas pruebas.

Touch físico y movimiento reducido renderizado no se ejercitaron; este último
tiene respaldo de fuente. Las capturas no certifican cada frame ni todos los
estados de error/carga. El launcher/detector había fallado con
cache_directory_failed y no se reejecutó; no existe resultado del detector.
PRODUCT.md, DESIGN.md y el sidecar permanecen sin modificar: sus descripciones
históricas de login y cabecera no sustituyen esta excepción local vigente.
El veredicto no certifica autenticación real, toda HOME ni otras rutas.

## Refinamiento vigente: acceso con cabeza de Hito — 18 de octubre de 2026

Esta nota sustituye la composición y los comportamientos de Hito grande,
paleta, encaje y envío vacío descritos en la extensión de acceso anterior.
El usuario pidió cabeza sin brazos ni manos, seguimiento ocular más visible,
cierre de ojos al enfocar contraseña, formulario azul/púrpura y acceso sin
scroll vertical ni horizontal. Se mantiene el lenguaje expresamente fijado
de esquinas rectas, bordes gruesos y sombras duras, junto a los textos y
controles de autenticación existentes. Es una excepción local de /login en
modo Operate; no redefine el sistema de las otras rutas.

LoginHito recorta solamente la cabeza de public/img/hito3.webp, que permanece
sin modificar. Conserva rostro, pico y textura de los iris originales; el
canvas recompone el blanco ocular y desplaza los iris hasta 24px horizontales
y 18px verticales en sus coordenadas locales, con una respuesta suavizada.
El cierre usa párpados púrpura con costura curva, sin cobertura de manos.
El grupo de contraseña mantiene los ojos cerrados al alternar visibilidad.
El render continúa por demanda, limpia sus listeners y pausa con documento
oculto; movimiento reducido fija la mirada y aplica el estado sin transición.
La copia public/img/institutional/login/hito-rig.png de la nota anterior fue
retirada al quedar sin uso. No se modificó su fuente scripts/hito-source/rig-v4.png
ni se creó un recurso raster de reemplazo.

El cuerpo del cuadro usa índigo #29295d, la cabecera púrpura #662065 y el fondo
y campos papel #f6f1fa. Reutiliza dos aviones dorados del SVG existente
public/img/institutional/collage/paper-plane.svg, situados a los lados y con
flotación CSS sin interacción; se detienen con documento oculto o movimiento
reducido. PublicShell monta también HitoPet en /login, conservando las
preferencias y comportamiento de la mascota pequeña existente.

La escena mide 100dvh y ResizeObserver ajusta el grupo completo mediante una
escala uniforme cuando falta espacio. Pantallas bajas compactan la cabeza y
el formulario; horizontal coloca cabeza y cuadro en columnas y reserva suelo
para la mascota pequeña. La regla html:has(.scene) bloquea overflow solamente
mientras el acceso está montado, sin escribir un estilo inline en html.
Ingresar permanece deshabilitado hasta tener usuario no vacío tras trim y al
menos un carácter de contraseña; además se bloquea durante loading. El guard
de envío refuerza esa condición. Se conservan handler, endpoints, sesión y
redirecciones; no se ejercitó autenticación real.

Disposition: ship, sin hallazgos materiales en este refinamiento. El reviewer
inspeccionó primero las seis capturas finales de ../review/:
login-head-desktop.png, login-head-look-left.png,
login-head-closed-desktop.png, login-head-mobile.png, login-head-320.png y
login-head-landscape.png; después comparó el Hito original, la fuente y el
contexto existente. Las capturas muestran cabeza reconocible sin manos,
miradas opuestas visibles, párpados cerrados, formulario completo y aviones
que no obstruyen controles. La captura final 320×568 corresponde al ajuste
que reserva espacio bajo el formulario para HitoPet. El placeholder puede
recortarse dentro del campo estrecho sin ocultar su etiqueta ni control.

El builder informó documento igual al viewport, sin overflow en 1440×900,
390×844, 320×568 y 760×430. En 320px la escala medida fue .9902, el cuadro
terminó aproximadamente en y=472 y la mascota quedó visible debajo; en
horizontal el cuadro terminó aproximadamente en y=330 y dejó suelo visible.
Informó botón deshabilitado con solo usuario y habilitado con un carácter
sintético en cada campo, limpiados después; foco de contraseña con ojos
cerrados y desplazamiento del centro negro ocular de aproximadamente 17.6px
entre miradas opuestas. Informó además restauración de overflow al salir a
HOME mediante el logo, scroll nativo de HOME verificado y bloqueo restaurado
al volver a /login, sin mutación inline de html. ESLint dirigido de los tres
componentes y git diff --check fueron informados como aprobados, sin errores
de consola en la última comprobación. El reviewer no repitió estas pruebas.

No se probaron teclado virtual, touch físico ni el render emulado de movimiento
reducido; sus alternativas tienen respaldo de fuente. No se certifican cada
frame, todos los errores/carga ni autenticación real. El launcher/detector
había fallado con cache_directory_failed, no se reejecutó y no hay resultado
del detector. PRODUCT.md, DESIGN.md y el sidecar permanecen sin modificar;
esta nota tiene autoridad sobre sus descripciones históricas del acceso
exclusivamente para el alcance descrito. No se amplía el veredicto a HOME,
el menú completo, otras rutas o el panel.

## Refinamiento vigente: Hito sostiene el acceso — 18 de octubre de 2026

Esta nota sustituye las composiciones, paletas y descripciones oculares de
las dos notas de acceso anteriores. Por la última solicitud del usuario, el
fondo pasa a azul institucional #304d90 y el cuadro a lavanda #e2bcf1, con
campos papel #f6f1fa y acción habilitada púrpura #662065. Se retira el título
visible «Iniciar sesión»; permanece un h1 accesible «Acceso sediprano».
Usuario, Contraseña, control de visibilidad e Ingresar mantienen sus funciones.
El usuario conserva expresamente esquinas rectas, bordes gruesos y sombras
duras. Es una excepción local de /login, modo Operate, sin alcance sobre el
panel, HOME ni las otras rutas.

La cabeza original asoma sobre un formulario menor, las manos aparecen a los
lados y los pies debajo: el cuerpo queda implícito detrás del cuadro. Rostro,
pico, iris y pies proceden de public/img/hito3.webp, sin modificar ese recurso.
Las manos son ventanas SVG del bitmap original scripts/hito-source/rig-v4.png,
copiado sin cambios a public/img/institutional/login/hito-rig.png; SHA256
5A4ABEA41894B3EDD5D1F655D171FA608DD2057D1079E6BBC7BAC867BB20E9EB.
No se creó una ilustración raster nueva ni se dibujó una figura SVG sustituta.
Canvas conserva el seguimiento ocular y usa contornos Path2D que siguen los
bordes internos inclinados y las esquinas inferiores de los ojos originales.
Los párpados cierran dentro de esos contornos al enfocar el grupo de contraseña,
también al alternar su visibilidad. Las manos permanecen en el cuadro.

Los campos eliminan el halo púrpura y conservan cambio de borde a azul y fondo
blanco como indicación de foco; el control ocular e Ingresar mantienen foco
visible azul. Continúan la escena de 100dvh, el ajuste uniforme con
ResizeObserver y el bloqueo de overflow limitado al acceso. En horizontal
bajo (altura máxima 520px y ancho mínimo 600px), la cabeza se centra sobre el
cuadro, los campos se presentan en dos columnas y la acción ocupa todo el
ancho; los pies siguen debajo. Se corrigió la disposición inicial de cabeza
lateral separada, que rompía la silueta de Hito sosteniendo el formulario.
Aviones existentes y HitoPet conservan su presencia y comportamiento.

Disposition: ship para este refinamiento acotado. La revisión independiente
inspeccionó primero ../review/login-sign-desktop.png (1440×900),
login-sign-closed-desktop.png (1440×900), login-sign-mobile.png (390×844),
login-sign-320.png (320×568) y login-sign-landscape.png (760×430), junto al
Hito original y rig-v4.png; después contrastó la fuente y el contexto. La
única corrección material fue la silueta horizontal. Una recaptura final de
login-sign-landscape.png confirma cabeza, cuadro, manos y pies unidos en una
sola composición; no hubo nueva búsqueda de mejoras. Las capturas desktop y
retrato siguen correspondiendo al código fuera del media query horizontal.
El ajuste de párpados dentro de los bordes originales resuelve la objeción
anterior del usuario sobre su alineación; no se afirma equivalencia de píxeles.

El builder informó documento igual al viewport y ausencia de overflow en
1440×900, 390×844, 320×568 y 760×430; escala 1 en 320px y en la horizontal
corregida, con campos y botón de 44px en esta última. Informó outlineStyle
none en ambos campos, cierre ocular con data-covered=true, botón deshabilitado
con solo usuario y habilitado con un carácter sintético en cada campo,
limpiados después sin envío. ESLint dirigido de los tres JSX y git diff
--check fueron informados como aprobados, sin nuevos errores de consola.
Se conservan los handlers, rutas, sesión y redirecciones existentes; no se
ejercitó autenticación real. El reviewer no repitió esas pruebas funcionales.

Teclado virtual, touch físico y render emulado de movimiento reducido no se
probaron. Este último conserva respaldo de fuente; no se certifican todos
los frames ni estados de error/carga. El launcher/detector había fallado con
cache_directory_failed, no se reejecutó y no hay resultado del detector.
PRODUCT.md, DESIGN.md y el sidecar permanecen sin cambios: esta nota tiene
autoridad para el alcance descrito sobre sus descripciones históricas de login.

## Ajuste vigente: agarre y cuadro blanco — 18 de octubre de 2026

Esta nota sustituye únicamente el color, sombra exterior y relación de manos
y pies del cuadro descritos en el refinamiento anterior. Por solicitud del
usuario, el cuadro es blanco sin sombra exterior; los controles conservan su
tratamiento interno. Las manos suben a la fila Usuario y un clip SVG curvo
recorta las muñecas según el trazo aportado por el usuario, conservando el
bitmap original hito-rig.png. Los pies quedan detrás del cuadro, con la unión
superior oculta. No cambian cabeza, mirada, párpados, autenticación, fondo azul,
aviones ni mascota pequeña. Es una excepción local de /login.

Disposition: ship para este ajuste acotado. El reviewer inspeccionó primero
el trazo del usuario y después ../review/login-grip-desktop.png (1440×900),
login-grip-mobile.png (390×844) y login-grip-landscape.png (760×429).
Las dos capturas responsive sustituyen archivos iniciales mal dimensionados;
sus dimensiones finales se verificaron con System.Drawing. Muestran el cuadro
blanco completo, palmas curvas al nivel de Usuario y pies detrás de su borde
inferior. No se exige equivalencia exacta de píxeles con el trazo.

El builder informó fondo del cuadro rgb(255, 255, 255), box-shadow none y
documento igual al viewport en 1440×900, 320×568 y 760×430, además de ESLint
dirigido de login-access.jsx y git diff --check aprobados. El reviewer contrastó
el clip, las posiciones y las capas en fuente; no repitió esas pruebas ni los
estados funcionales sin cambios. La captura horizontal es un píxel más baja
que el viewport informado. No se probaron autenticación real, teclado virtual,
touch físico ni movimiento reducido en este ajuste. El launcher/detector
había fallado con cache_directory_failed, no se reejecutó y no hay resultado
del detector. No se amplía este veredicto a otras rutas ni a todo el acceso.

## Ajuste vigente: dorso de las manos redondeado — 18 de octubre de 2026

Esta nota sustituye únicamente el contorno del clip de las manos del ajuste
anterior. El trazo orientativo del usuario se suaviza en un dorso continuo y
redondeado mediante dos curvas cúbicas; el bitmap original se conserva. El
cuadro blanco sin sombra exterior, la altura del agarre junto a Usuario y la
ocultación de la unión superior de los pies permanecen aprobados.

Disposition: ship para este cambio acotado, sin hallazgos materiales. La
revisión independiente inspeccionó ../review/login-grip-rounded-desktop.png
(1280×720) y login-grip-rounded-mobile.png (390×844), comparó las capturas
login-grip-desktop.png y login-grip-mobile.png anteriores y contrastó el clip
en login-access.jsx. Ambas manos presentan un borde exterior suave y el
formulario sigue completo y legible. No se repitieron pruebas funcionales,
autenticación ni otros tamaños; el veredicto cubre solo este contorno y no
amplía las verificaciones anteriores. PRODUCT.md, DESIGN.md y el sidecar
permanecen sin cambios.

## Ajuste vigente: recorte posterior de las palmas — 18 de octubre de 2026

Esta nota sustituye únicamente el contorno del clip anterior. Según el óvalo
blanco aportado por el usuario, se retira más muñeca con un dorso redondeado;
las puntas de los dedos permanecen completas en el bitmap original. Se
conservan altura de agarre, cuadro blanco y los demás elementos del acceso.

Disposition: ship para este cambio acotado, sin hallazgos materiales. La
revisión independiente comparó la referencia del usuario con
../review/login-palm-cut-desktop.png (1280×720) y login-palm-cut-mobile.png
(390×844), la captura desktop anterior y el clip en login-access.jsx. Las
capturas muestran menos muñeca, dorso suave y dedos sin recorte, con formulario
completo. ESLint dirigido fue informado como aprobado; no se repitieron
pruebas funcionales, autenticación ni otros tamaños. El veredicto cubre solo
este contorno; no amplía verificaciones anteriores. PRODUCT.md, DESIGN.md y
el sidecar permanecen sin cambios.

## Ajuste vigente: punta inferior de la muñeca eliminada — 18 de octubre de 2026

Esta nota sustituye únicamente la aprobación del contorno de las manos en la
nota anterior: aún quedaba una punta descendente bajo el dedo meñique. El
clip actual retira esa cuña de muñeca y conserva los dedos del bitmap original.

Disposition: ship para la eliminación de esa punta. La revisión independiente
inspeccionó de cerca el círculo de la referencia del usuario y
../review/login-no-wrist-tip-detail.png; contrastó después
login-no-wrist-tip-desktop.png (1280×720), login-no-wrist-tip-mobile.png
(390×844), login-palm-cut-desktop.png y el clip en login-access.jsx. El borde
inferior termina ahora con una curva continua, sin la prolongación triangular
señalada; ambos agarres conservan los dedos y el cuadro completo. ESLint fue
informado como aprobado. No se repitieron pruebas funcionales ni otros tamaños;
este veredicto cubre solo la punta señalada. PRODUCT.md, DESIGN.md y el sidecar
permanecen sin cambios.

## Ajuste vigente: proporción original de los iris — 18 de octubre de 2026

Esta nota sustituye únicamente la proporción y posición de reposo de los iris
del acceso. En login-hito.jsx el recorte original de 94×106 se presenta a ese
mismo tamaño, con máscara de radios 47×53 y centros interiores originales
(440/637, 242). public/img/hito3.webp permanece intacto. Se conserva el
seguimiento del puntero y el cierre de párpados al enfocar Contraseña.

Disposition: ship para este ajuste acotado, sin hallazgos materiales. La
revisión independiente comparó la referencia del usuario y hito3.webp con
../review/login-original-irises-detail.png y login-original-irises-look-right.png;
los iris recuperan el tamaño original y la mirada sigue desplazándose. Contrastó
login-original-irises-closed.png, login-original-irises-desktop.png (1280×720)
y login-original-irises-mobile.png (390×844): el cierre ocular y la composición
del formulario se conservan. ESLint dirigido fue informado como aprobado.
No se repitieron pruebas funcionales ni autenticación; no se certifica cada
frame ni equivalencia exacta de píxeles. El veredicto cubre solo la proporción
ocular, sin ampliar verificaciones anteriores ni modificar los documentos raíz.

## Ajuste vigente: portada móvil de Proyectos y cierre compartido — 18 de octubre de 2026

Proyectos usa ahora el título único «Proyectos». Bajo 768px la portada centra
el titular y «Ver proyectos»; el listado asciende desde abajo con una cresta
y la indicación «Desliza». En escritorio se conserva el barrido horizontal.
El CTA lleva al inicio del listado y los enlaces de proyectos mantienen su
contenido. Proyectos y Nosotros incorporan SocialShowcase y PublicFooter en
ElasticSection; HOME conserva su montaje anterior. El teléfono se oculta en
móvil y su animación y precarga de perfiles requieren ancho de escritorio.

Disposition: ship para este alcance, sin hallazgos materiales. La revisión
independiente inspeccionó project-portfolio.jsx y su CSS, social-showcase.jsx
y su CSS, footer.jsx y el montaje de las tres rutas. Contrastó la referencia
del usuario con ../review/projects-mobile-hero.png, projects-mobile-list.png,
projects-mobile-networks.png, projects-mobile-footer.png, projects-320-hero.png,
projects-desktop-hero.png, projects-desktop-sweep.png,
projects-desktop-networks.png, about-mobile-footer.png y home-mobile-footer.png.
El titular y el CTA caben en 320px; el teléfono permanece visible en la captura
desktop y ausente en las capturas móviles. El builder informó un bloque de
redes y un footer por ruta, teléfono oculto en móvil, CTA que descubre el primer
proyecto, ESLint dirigido y diff check aprobados. Esta revisión no repitió esas
pruebas funcionales ni certifica cada frame, dispositivos físicos o paridad
exacta con la referencia. El veredicto cubre únicamente estos cambios;
PRODUCT.md, DESIGN.md y su sidecar permanecen sin cambios.

## Ajuste vigente: CTA, descripción y cierre móvil de Proyectos — 18 de octubre de 2026

Esta nota sustituye únicamente el tratamiento del CTA y la portada de Proyectos
anterior: «Ver proyectos» usa #662065 con texto blanco, y una descripción breve
aclara que el listado es una selección de proyectos destacados. Ambos aparecen
en escritorio y móvil; escritorio conserva alineación izquierda y móvil centra
el conjunto. El escenario sticky y la portada móviles usan 100dvh para concordar
con la altura innerHeight usada por el recorrido. El barrido desktop conserva
100svh. Los montajes de PublicFooter en Proyectos y Nosotros añaden un div que
preserva el fondo propio #29295d frente al selector directo de ElasticSection.
HOME conserva su montaje.

Disposition: ship para este ajuste acotado, sin hallazgos materiales. La revisión
independiente inspeccionó project-portfolio.jsx, su CSS y los montajes de
Proyectos/Nosotros; contrastó ../review/projects-copy-desktop.png,
projects-copy-mobile.png, projects-mobile-no-gap.png,
projects-mobile-no-gap-scrolling.png y projects-blue-footer.png. La descripción
y el CTA son legibles en ambas composiciones; los dos estados móviles del
listado cubren el borde inferior y el footer final aparece índigo.

El builder informó ESLint dirigido de tres archivos aprobado, footer computado
rgb(41, 41, 93) y una simulación de viewport 390×844 a 390×920 con listado
abierto y posterior scroll: stageBottom y panelBottom 920.38 frente a innerHeight
920. La revisión no repitió esas medidas. La simulación no verifica las barras
dinámicas de Android real. No se certifican dispositivos físicos, todos los
frames ni paridad exacta con la referencia. La captura projects-320-hero.png
anterior no corresponde a este ajuste y no se usa como evidencia de la nueva
descripción. El veredicto no amplía el alcance anterior. PRODUCT.md, DESIGN.md
y su sidecar permanecen sin cambios.

## Ajuste vigente: lectura nativa móvil y contorno final de Proyectos — 18 de octubre de 2026

Esta nota sustituye únicamente la descripción, dirección del CTA, recorrido
móvil y espacio final del listado de las notas anteriores de Proyectos.
La descripción exacta es «Algunos de nuestros proyectos más destacados.».
El CTA conserva flecha derecha en escritorio y apunta abajo en móvil.
Bajo 768px la portada y el listado siguen el flujo vertical nativo, con cresta
y «Desliza» conservados. El CTA usa scrollIntoView; escenario fijado,
transformaciones del panel y suscripción del índice al progreso quedan
reservados al escritorio. Los contornos móviles usan borde CSS y dejan de
observar el tamaño de cada fila. Se conservan useScroll y los valores Motion
compartidos; no se afirma haber eliminado todo JavaScript asociado al scroll.
El padding inferior del listado es 180px en ambos tamaños para mantener el
último contorno completo frente al separador de la sección siguiente.
El barrido horizontal y la composición de escritorio se conservan.

Disposition: ship para este ajuste acotado, sin hallazgos materiales. La
revisión independiente inspeccionó project-portfolio.jsx y su CSS y las
capturas ../review/projects-native-desktop-hero.png,
projects-native-desktop-list.png, projects-native-desktop-last.png,
projects-native-mobile-hero.png, projects-native-mobile-list.png,
projects-native-mobile-expanded.png y projects-native-mobile-last.png.
Las portadas muestran la descripción y las flechas solicitadas; los dos
cierres muestran el contorno completo del último proyecto. La captura móvil
expandida conserva el fondo índigo durante el listado. El builder informó
ESLint dirigido y git diff --check aprobados, además de flujo relativo y
panel sin transformación en móvil; el reviewer no repitió esas mediciones.

La simulación de viewport 390×844 a 390×920 no verifica las barras dinámicas
de Android físico. No se midió rendimiento en Android real ni se certifican
todos los frames, tamaños o estados. La fuente elimina el recorrido fijado
móvil, pero no constituye un benchmark de fluidez. El launcher falló con
cache_directory_failed y no hay resultado del detector. Este veredicto cubre
solo el alcance descrito; PRODUCT.md, DESIGN.md y su sidecar permanecen sin
cambios.

## Ajuste vigente: portada, directiva y áreas de Nosotros — 18 de octubre de 2026

Esta nota sustituye únicamente las descripciones anteriores de esos tres
bloques de /nosotros. La portada usa «Nosotros», con la misma familia, peso y
clamps de Proyectos: 86px/12.5vw/210px en escritorio y 54px/15vw/110px bajo
768px. La descripción exacta es «Impulsando el liderazgo en dirección de
proyectos.». «Conócenos» usa púrpura #662065 y flecha abajo; «Explorar» y su
flecha permanecen en la cresta inferior de escritorio y móvil.

Las siete personas de la directiva conservan su orden, fotografías y cargos;
content.js aporta las carreras, los nombres actualizados y los enlaces
personales indicados por el usuario, normalizados a https://linkedin.com.
El icono LinkedIn mide 18px dentro de un enlace de 44×44px, con nombre accesible
por persona. Estos datos proceden del usuario; no se certifica externamente
la identidad o disponibilidad de cada perfil.

Áreas presenta «Cinco áreas.» y «Cada pieza forma parte de nuestro equipo.».
Se conservan Lanzar todos y Reiniciar, se retiran las instrucciones de teclado
y arrastre y la leyenda decorativa pasa a «Equipo multidisciplinario.».
Los cubos miden 128px en escritorio y 96px bajo 600px. Cada cubo y cada fila
seleccionan el mismo acordeón controlado: solo un área abierta, pulsación
repetida para cerrar, y textos de las cinco áreas aportados por el usuario.
La selección desde un cubo desplaza la vista al título correspondiente.
El arrastre superior a 6px suprime el clic. Con movimiento reducido no se
inicia la física, los controles de lanzamiento/reinicio están deshabilitados
y los cubos siguen siendo botones de selección. El enlace TI se retira de
este bloque; el footer conserva el suyo.

Disposition: ship para este alcance, sin hallazgos materiales. La revisión
independiente inspeccionó primero las nueve capturas de ../review/ con prefijo
about-updated-: desktop-hero.png, desktop-team.png, desktop-cubes.png,
desktop-area-open.png, mobile-hero.png, mobile-team.png, mobile-cubes.png,
mobile-area-open.png y 320-hero.png. Después contrastó about-experience.jsx,
about-playground.jsx, su CSS, content.js y los clamps de Proyectos. Las
portadas caben hasta 320px, la información de directiva mantiene jerarquía
legible y los paneles de áreas muestran texto completo en sus estados
capturados. No hubo cambios de UI durante esta revisión.

El builder informó comprobación de los cinco contenidos y apertura única,
cierre mediante Enter, selección de GTH/TI desde cubos y desplazamiento al
título, siete href personales exactos, ningún enlace TI en áreas y uno en el
footer. Informó ESLint dirigido de tres archivos y git diff --check aprobados.
También informó una prueba de arrastre de GTH en escritorio 1440×900: el
cubo se desplazó con inercia y el único panel abierto siguió siendo PMO,
sin abrir GTH. Lanzar todos y Reiniciar se accionaron antes de esa prueba;
el escenario inicial se restauró. La captura adicional
../review/about-updated-desktop-drag.png registra ese estado y la consola
informada no contenía errores. Esta comprobación acotada no prueba touch
físico ni todas las trayectorias de arrastre.
El reviewer no repitió estas pruebas. El render de movimiento reducido,
touch físico y Android real no se probaron; la alternativa reducida tiene
respaldo de fuente. No se certifican cada frame, todos los tamaños o paridad
exacta con referencias. El launcher/detector había fallado con
cache_directory_failed y no se reejecutó en esta revisión; no hay resultado
del detector. PRODUCT.md, DESIGN.md y su sidecar permanecen sin cambios;
este veredicto no se extiende a otras rutas ni a todo /nosotros.

## Refinamiento de áreas e impacto · 2026-10-18

Esta nota reemplaza las medidas y textos del bloque de áreas descritos arriba.
Áreas conserva únicamente «Cinco áreas.» en su cabecera, alineado con Lanzar
todos y Reiniciar. Se retiraron «Cada pieza forma parte de nuestro equipo.» y
«Equipo multidisciplinario.». El espacio entre cabecera y escenario es 16px.
Los cubos pasan a 144px en escritorio y 108px bajo 600px, con GTH verde, PMO
amarillo, MKT rojo, LTK & FNZ celeste y TI naranja. Cada uno conserva una base
blanca para el emblema y una sigla con contraste específico. MKT mantiene el
nombre real del área; Administración sigue siendo la carrera de Cielo.

Impacto usa los siete datos entregados por el usuario en un carrusel con
scroll-snap, botones anterior/siguiente, progreso visible y anuncio aria-live.
Muestra tres datos en escritorio, dos en tablet y uno completo en móvil. Se
validó visualmente en 1280×720 y 390×844, el avance del carrusel, la apertura
por toque y teclado de los cubos y la exclusión mutua de paneles. ESLint dirigido
y git diff --check aprobaron; la consola del navegador no registró errores.
Capturas: ../review/about-areas-carousel-desktop.png,
../review/about-areas-carousel-mobile.png,
../review/about-impact-carousel-desktop.png y
../review/about-impact-carousel-mobile.png.

## Nosotros: cinta continua y camino de reconocimientos · 2026-10-18

Esta actualización sustituye el carrusel manual de impacto y el acordeón de
reconocimientos. Los siete datos de impacto forman una cinta CSS lineal de
58 segundos con dos grupos idénticos: el segundo está oculto para tecnologías
de asistencia. No hay flechas ni pausa por hover. La presión de puntero o de
Espacio/Enter pausa la animación en su posición; al soltar, cancelar, perder la
captura o perder el foco vuelve a avanzar. Con movimiento reducido hay lectura
horizontal nativa sin desplazamiento automático. La comprobación en navegador
registró animation-play-state paused durante una pulsación prolongada y running
tras liberarla; las dos copias midieron 2058px en móvil, conservando la unión.

Nosotros añade ElasticSection entre esencia/directiva, áreas, impacto,
reconocimientos y redes. Los dos capítulos internos del relato reciben curvas
que siguen la velocidad del scroll, verticales en desktop y horizontales en
móvil. La entrada con Explorar se conserva. El cierre «Proyectando vidas.
Construyendo futuro.» se retira de esta ruta y el color anterior de redes pasa
a papel #f6f1fa.

about-recognition-journey muestra los 14 reconocimientos originales entregados
por el usuario, agrupados entre 2020 y 2025. El mapa desktop asciende desde los
años inferiores, con carretera SVG medida desde los marcadores reales, montañas
vectoriales azules y bandera azul animada con el logo original en blanco.
La navegación por año centra el grupo y los marcadores destacan el año sin
ocultar logros. En móvil el DOM mantiene orden cronológico ascendente y cada
tramo vertical adapta su altura al contenido. La bandera y montañas cierran
el camino en un espacio propio, sin cubrir el texto de 2025. Los iconos son
Lucide Trophy, Medal, Landmark y Users, según el reconocimiento.

Se revisaron 1440×1000 y 390×844: 14 títulos de logros presentes, cero flechas
en impacto, cierre retirado, dos curvas internas y cinco separadores de bloque.
Se probó navegación a 2020/2025, pausa/reanudación y ausencia de desbordamiento
horizontal y errores de consola. ESLint dirigido y git diff --check aprobaron.
No se probó un dispositivo físico. Evidencia actual: ../review/about-road-desktop.png,
../review/about-road-desktop-lower.png, ../review/about-road-mobile.png y
../review/about-road-mobile-2025.png. Las capturas antiguas del carrusel manual
son históricas. PRODUCT.md y DESIGN.md permanecen sin cambios.

## Reconocimientos: sustitución de la escena desktop · 2026-10-18

La escena desktop anterior fue rechazada por el usuario. Desde 900px se
sustituye por RecognitionLandscape, trazada con el sistema de coordenadas de
desktop.jpeg: carretera ancha en primer plano, curvas progresivamente más
estrechas y llegada fina junto a una persona con bandera. El asfalto tiene
ancho variable, bordes continuos, línea discontinua y sombra proyectada. Cinco
montañas facetadas con nieve usan azules derivados de SEDIPRO. La bandera azul
conserva el logo institucional blanco y su movimiento. No se afirma identidad
de píxeles con la referencia.

La cronología aportada comprende seis años (2020–2025), por lo que se conservan
seis checkpoints para los 14 logros. Cada botón abre un panel flotante con los
trofeos, medallas y categorías del año. Solo un panel puede estar abierto; se
cierra con la X, Escape o pulsando fuera. Escape y la X restituyen el foco al
marcador. Se validaron los seis paneles en 1440×1000: contienen respectivamente
2, 2, 2, 1, 4 y 3 logros, sin desbordamiento lateral. El de 2024 se abrió con
Enter y cerró con Escape. Consola sin errores. La variante inferior a 900px
conserva su camino vertical, navegación y 14 logros visibles; se comprobó en
390×844. No se probó dispositivo físico.

Evidencia vigente: ../review/recognition-perspective-desktop.png,
../review/recognition-perspective-popup.png y
../review/recognition-perspective-mobile-unchanged.png. Las capturas about-road
de desktop describen la versión rechazada. Este cambio no afecta la cinta de
impacto ni los separadores del resto de Nosotros.

## Impacto compacto y cierre compartido con Inicio · 2026-10-18

La cinta de Nosotros acelera de 58s a 34s por vuelta; mantiene los siete datos,
el bucle y la pausa durante la presión. Impacto reduce su padding inferior a
64px en desktop y 36px bajo 600px, y retira la altura mínima de las cifras.
Las etiquetas conservan 92px/64px de separación respecto al borde inferior:
el espacio incluye los 28px internos necesarios para que el SVG superior de
la sección siguiente no tape sus últimos píxeles.

Las uniones de entrada y salida de impacto pasan a joined + revealBackground.
El fondo anterior ocultaba la deformación al coincidir con el relleno del
SVG; ahora el fondo es el de la siguiente superficie, sin el espaciador de
80px/50px. Se observaron los dos paths en movimiento: el control central
varió respecto a 80 (107.69 arriba y 63.55 abajo). La alternativa reducida
del separador sigue intacta.

El título de reconocimientos alinea su borde izquierdo a 8vw en desktop,
igual que Cinco áreas e Impacto, y conserva 24px en móvil. Se verificó la
coincidencia de X en navegador (102.39px desktop y 24px móvil).
Después del mapa se reutiliza EditorialBands closing con el mismo
ElasticSection de Inicio: textos Proyectando vidas / Construyendo futuro,
fotografías story/1.jpg y story/3.jpeg y movimiento contrapuesto. No se copia
una versión independiente. Se comprobó una sola instancia y orden DOM
reconocimientos → cierre → contacto/redes.

ESLint dirigido y diff check aprobaron. Revisión en 1280×720 y 390×844, sin
errores de consola ni desbordamiento horizontal. Capturas actuales:
../review/about-impact-compact-desktop.png,
../review/about-impact-compact-mobile.png,
../review/about-home-closing-desktop.png y
../review/about-home-closing-mobile.png. La última muestra una intervención
temporal de la mascota existente sobre el texto; no se cambió su conducta.

### Menor separación entre mapa y cierre

Se reduce el padding inferior de reconocimientos a 48px en desktop y 40px
en móvil. El cierre de Nosotros usa ElasticSection joined y la variante
compact de EditorialBands (24px arriba), sin alterar el cierre de Inicio.
La distancia medida desde la ilustración hasta la primera banda pasa de
300px a 72px en desktop; en móvil queda en 44px desde la base de las montañas.
ESLint y diff check aprobados, consola sin errores y sin desbordamiento lateral
en 1280×720/390×844. Captura: ../review/about-closing-gap-desktop.png.

---
name: SEDIPRO UNT — sitio público
description: Publicación viva sobre dirección de proyectos hecha por estudiantes.
colors:
  public-primary: "#662065"
  public-secondary: "#29295d"
  public-blue: "#304d90"
  public-ink: "#141020"
  public-paper: "#f6f1fa"
  journey-panel-white: "#fff"
  cover-paper: "#fbfaf7"
  public-muted: "#cdc3dc"
  public-action: "#e2bcf1"
  public-action-hover: "#efdbf7"
  public-line: "rgba(222, 203, 239, 0.25)"
  smoke-base: "#0b1326"
  smoke-purple: "#5227FF"
  smoke-pink: "#FF9FFC"
  smoke-lavender: "#B497CF"
  login-paper: "#f4f1ea"
  login-black: "#000"
  login-white: "#fff"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(65px, min(9.5vw, 15.3svh), 154px)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(54px, 6.2vw, 94px)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  page-title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(78px, 8.8vw, 140px)"
    fontWeight: 650
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  editorial-band:
    fontFamily: "Instrument Serif, serif"
    fontSize: "clamp(80px, 13vw, 200px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  action-label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "11px"
    fontWeight: 750
    letterSpacing: "0.03em"
  home-headline:
    fontFamily: "Inter Tight, sans-serif"
    fontSize: "clamp(46px, 5.4vw, 88px)"
    fontWeight: 550
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  home-lead:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(21px, 2vw, 29px)"
    lineHeight: 1.4
    letterSpacing: "-0.015em"
  journey-title:
    fontFamily: "Inter Tight, sans-serif"
    fontSize: "clamp(64px, 10.8vw, 156px)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  journey-panel-title:
    fontFamily: "Inter Tight, sans-serif"
    fontSize: "clamp(36px, 3.7vw, 53px)"
    fontWeight: 500
    lineHeight: 1.03
    letterSpacing: "-0.035em"
rounded:
  action: "5px"
  hero-photo: "8px"
  documentary-photo: "10px"
  story-photo: "0"
  circle: "50%"
  login: "0"
  journey-sheet: "52px 52px 0 0"
  journey-sheet-mobile: "30px 30px 0 0"
  journey-polaroid: "0"
  journey-panel: "16px"
  journey-action: "12px"
spacing:
  header-inline: "3.8vw"
  section-inline: "6vw"
  mobile-inline: "24px"
  mobile-header-inline: "20px"
  journey-panel: "40px"
components:
  button-primary:
    backgroundColor: "{colors.public-action}"
    textColor: "{colors.public-ink}"
    typography: "{typography.action-label}"
    rounded: "{rounded.action}"
    padding: "17px 25px"
  button-primary-hover:
    backgroundColor: "{colors.public-action-hover}"
  login-card:
    backgroundColor: "{colors.login-paper}"
    textColor: "{colors.login-black}"
    rounded: "{rounded.login}"
  login-input:
    backgroundColor: "{colors.login-white}"
    textColor: "{colors.login-black}"
    rounded: "{rounded.login}"
    padding: "0 16px"
    height: "48px"
  journey-panel:
    backgroundColor: "{colors.journey-panel-white}"
    textColor: "{colors.public-secondary}"
    rounded: "{rounded.journey-panel}"
    padding: "{spacing.journey-panel}"
  journey-action:
    backgroundColor: "{colors.public-primary}"
    textColor: "{colors.journey-panel-white}"
    rounded: "{rounded.journey-action}"
    padding: "14px 20px"
---

# Design System: SEDIPRO UNT — sitio público

## Overview

La apertura vigente de `/` conserva `PublicHero` con la portada institucional
y después `#historia`/`ElasticSection`/`ScrollStory`, tal como estaban antes de
la extensión. `ProjectJourney` añade solamente la parte de Dirección de proyectos
y SEDIPRO después del relato y antes de Nuestro enfoque. Sus dos heroes, papel
ascendente, cinta, fotografías y video se conservan. La portada contiene el
único h1; el primer titular del journey pasa a h2 sin cambio visual.

**Creative North Star: "Una publicación viva"**

Una presentación editorial de SEDIPRO UNT: títulos monumentales, fotografías institucionales y serif expresiva entre superficies de los tres colores de marca. Las superficies son planas, con líneas finas y espacio amplio para contar la historia del equipo. En HOME el líquido responde al mouse dentro de las escenas de color; las otras rutas conservan su tratamiento previo de humo.

La extensión local del 14 de octubre aplica la referencia MindMarket dentro
de ProjectJourney, después de ScrollStory: «Dirección / de proyectos.» sobre índigo y «¿Qué es / una
SEDIPRO?» sobre púrpura quedan detrás de sus hojas de papel lavanda que suben
con el scroll. Un punto inicial crece hasta convertirse en cinta con bucle y
continuación; los colajes usan personas reales, video y trazo de viento/avión.
Los Hito grandes de la versión previa se retiran de esta composición; la
mascota pequeña conserva su comportamiento. Es una extensión local del mundo
editorial, no una receta general de tarjetas ni una sustitución de identidad.
La revisión final del colaje emitió ship para el único hallazgo puntuado: el
contraste de navegación sobre fotografías. Las diez recapturas requeridas son
válidas y no muestran regresiones introducidas por esa corrección. El alcance
no certifica toda HOME; el ship previo corresponde a la versión histórica. No se afirma paridad exacta de píxeles ni
tiempos con MindMarket.

Este documento conserva el sistema implementado en `/`, `/proyectos`, `/nosotros` y el entorno público de `/login`, con una actualización actual limitada a `/`. El cuadro de acceso conserva su lenguaje original. El panel, las páginas de eventos y `/tecnologias-de-la-informacion` mantienen sus sistemas existentes; estas reglas no autorizan rediseñarlos. La composición y la evidencia de HOME se registran en `.impeccable/surfaces/public-site.md`.

**Key Characteristics:**

- Tipografía sans monumental con acentos serif editoriales.
- Escenas de índigo, azul y púrpura, papel claro, tinta oscura y acciones lavanda.
- Fotografía institucional, video local y recortes documentales con procedencia registrada; posters completos en las rutas existentes.
- Movimiento ligado al scroll con alternativas estáticas accesibles.

## Colors

### Primary

El púrpura institucional conserva la continuidad de marca; la lavanda clara identifica acciones y énfasis sobre la tinta oscura. El hover aclara las acciones. El humo conserva su combinación original de púrpura, rosa y lavanda.

### Secondary

El índigo y el azul institucional permanecen como anclas de identidad. El índigo aparece también como fondo de reserva de fotografías.

### Neutral

La tinta oscura sostiene secciones y menú; el marfil es el texto principal, el lavanda apagado aporta texto secundario y las líneas translúcidas separan filas. El papel de portada es más cálido y claro que el marfil de las secciones. El acceso original usa su propio papel cálido, blanco y negro.

ProjectJourney usa el papel `public-paper` como hoja y fondo de lectura principal, blanco para paneles y marcos Polaroid,
índigo para el texto, azul para la cinta y púrpura para las acciones. El gradiente
del cruce combina azul e índigo existentes; no incorpora un nuevo color de marca.

**The Scope Rule.** Las variables públicas viven en el contenedor público, no en la raíz global; conservar esa frontera evita transferir esta paleta al panel y a las páginas excluidas.

## Typography

Manrope e Instrument Serif se cargan con `next/font/google`, subconjunto latino y `display: swap`. Manrope usa `--font-public-sans`; Instrument Serif usa `--font-public-serif`, peso 400 y estilos normal e italic. Los `em` públicos emplean la serif.

Inter Tight usa `--font-story-sans` y sostiene los titulares del módulo
institucional HOME (peso 550, line-height 1.04, tracking -0.025em). Su escala
móvil es `clamp(40px, 10vw, 64px)`; cada escena puede aplicar el ajuste local
observado en el código. La familia declarada intenta primero TWK Lausanne,
pero ese archivo no está disponible: Inter Tight es la aproximación cargada,
sin afirmar equivalencia de licencia o métricas. Manrope mantiene el cuerpo;
Instrument Serif identifica los ámbitos del diagrama y los acentos editoriales.
El token display conserva el titular monumental anterior como registro del
sistema existente; la apertura actual de HOME usa la portada institucional y
los dos heroes de ProjectJourney aparecen después de ScrollStory.

ProjectJourney usa Inter Tight 500 en heroes y titulares de lectura. El hero
usa line-height .98 y tracking -.04em; en móvil su escala es
`clamp(48px, 12vw, 86px)`. Los titulares de lectura principales usan
`clamp(38px, 4.4vw, 64px)`; los paneles inferiores usan el rol del frontmatter.
Ambos comparten line-height 1.03 y tracking -.035em; hasta 767px usan
`clamp(34px, 9vw, 49px)`. El cuerpo Manrope usa
`clamp(17px, 1.55vw, 21px)`, line-height 1.55 y tracking -.015em; en móvil
permanece a 17px. No aplicar el peso 550 del enfoque a esta extensión.

El display de portada histórico ajustaba su tamaño al ancho y a la altura visible. Los títulos de secciones y subpáginas tienen roles distintos, según el frontmatter; los números de impacto usan cifras tabulares. El texto corrido hereda la escala base, mientras descripciones, notas y etiquetas tienen tamaños locales. No imponer un tamaño global a todos los párrafos.

El cuadro de acceso mantiene Geist/Arial y sus utilidades sans y mono originales. No aplicar Manrope ni Instrument Serif a su tipografía interna.

## Layout

La navegación fija sitúa la marca a la izquierda y las acciones a la derecha. La composición tipográfica de portada anterior usaba un ancho de `min(1180px, 78vw)`; la apertura HOME vigente conserva la portada institucional seguida de ScrollStory; ProjectJourney aparece después del relato. Las subpáginas conservan `min(1300px, 88vw)`, título y fotografía documental grande en dos columnas. El archivo alterna posters y texto; la directiva usa tres columnas.

Los media queries implementados son `min-width: 1700px`, `max-width: 1000px` y `max-width: 767px`. A partir de 1700px, las escenas fijadas se limitan a 1600px. Hasta 1000px se ajustan titulares, separaciones y fotografías. Hasta 767px, las secciones pasan a lectura vertical, con márgenes de 24px, cabecera de 20px, directiva de dos columnas y selector de cuatro números. La navegación de acceso permanece disponible dentro del menú.

ScrollStory vigente ocupa 320svh en escritorio y 280svh en móvil, con escenario sticky
de 100svh. Los tres artes de reconocimientos entran desde abajo y los laterales;
el texto se escribe y borra por líneas al cambiar entre tres etapas. Su tipografía usa 550,
line-height 1.1 y tracking -0.02em; TWK Lausanne es el nombre identificado en
la referencia, e Inter Tight es la aproximación disponible cargada con next/font.
No se distribuye el archivo de TWK Lausanne. En escritorio, el marco del arte
queda a 5% del borde izquierdo del escenario y mide 32% de su ancho y 72svh
de alto, con inicio a 12svh. El texto ocupa la columna disponible entre 42%
y el margen derecho de 4%, desde 35svh, con `clamp(40px, 6.05vw, 96px)`.
Los porcentajes siguen el escenario, incluido su límite de 1600px. Hasta 767px,
el arte usa márgenes de 24px, inicio a 10svh y alto de 42svh; el texto se sitúa
a 57svh, con los mismos márgenes y `clamp(26px, 8.25vw, 43px)`.
Los originales de 1080×1080, 864×1080 y 1080×1350 se muestran completos con
`object-fit: contain`, conservando color y proporción, sin scrim ni borde redondeado.
Debajo permanece únicamente «Conoce a SEDIPRO UNT», hacia `/nosotros`; se retiró
el párrafo institucional. Con movimiento reducido, el primer arte, el primer
titular y el enlace pasan a lectura estática; las posiciones laterales recuperan
`auto`. El enfoque HOME ocupa 380svh en
escritorio y 300svh en móvil, con escenario sticky de 100svh. Los círculos se
trasladan al centro, muestran Formación integral, se separan con leyendas
detalladas y luego el diagrama completo amplía la intersección hasta 5.8 veces,
con origen en 50% 44%; el texto lateral desaparece durante el zoom. Los valores
ocupan 220svh y 180svh respectivamente. Historia, enfoque y valores recuperan
lectura estática con movimiento reducido.

Las transiciones entre secciones de `/` usan dos curvas SVG cúbicas con extremos
planos. La deformación se concentra en el centro y sigue la velocidad y sentido
del scroll mediante una respuesta tanh y un resorte amortiguado. Se limitan a
72px de desplazamiento central en escritorio (45px en móvil) y regresan a la línea
recta al detenerse. El relleno solapa la unión inferior para evitar costuras claras. Fuera
del viewport no se fuerza la deformación; con movimiento reducido son planas.
Las superficies alternan índigo, azul, púrpura, papel claro y tinta.

En HOME, SectionLiquid se monta en historia, enfoque, valores,
áreas, PMI y marco de footer. Cada escena de color usa LiquidEther, con
respuesta al mouse y autoDemo desactivado, sin PageBackdrop ni luz superior.
ProjectJourney y la portada vigente no montan shader. El renderer se omite con movimiento reducido,
sin hover/puntero fino o con documento oculto; se prepara a 200px del viewport.
El lienzo se extiende 160px sobre cada escena (100px en móvil) hasta el separador.
La máscara SVG inversa de la superficie anterior sigue la curva y deja visible
el líquido. Las fotografías se recortan en un contenedor independiente.

El módulo institucional usa márgenes de 8vw y dos columnas en escritorio,
con cuerpo limitado según la escena a 34–65ch; hasta 767px pasa a una columna
y márgenes de 24px. Los ODS usan cuatro paneles de ancho medido. En escritorio,
ResizeObserver calcula el recorrido del track y la sección ocupa ese recorrido
más 100svh, con desplazamiento horizontal ligado al scroll vertical. En móvil
usa scroll horizontal nativo con snap y controles; con movimiento reducido
los cuatro paneles aparecen verticalmente, con altura natural.
Al pasar de móvil a escritorio se reinicia el scroll nativo del contenedor,
para que no se sume al desplazamiento del track ligado al scroll vertical.

ProjectJourney repite dos capítulos: hero sticky de 100svh, seguido por una
hoja en flujo que cubre el titular al subir. El lienzo limita el ancho a 1440px,
usa padding `140px 5% 220px` y altura mínima
`calc(min(100vw, 1440px) * 1.9)`. La introducción tiene columnas 43% / 53%
y gap 4%; la copia conserva un respaldo de papel para legibilidad sobre la
ruta. Los paneles inferiores ocupan el 49%, con fotografías a su lado.
Entre 768px y 1000px el lienzo usa 4% lateral y mínimo 2350px; las columnas
son 47% / 49% y el panel 55%. Hasta 767px hay lectura vertical, lienzo de
altura natural con padding `50px 24px 130px`, collage antes de su texto y
paneles al 100%. El scroll es vertical nativo, con anclas entre capítulos y
acción final a `/nosotros`. Nuestro enfoque conserva su comportamiento y
recibe el papel lavanda como color anterior de su separador.

## Elevation & Depth

La profundidad pública proviene del humo, del scrim, de capas tonales y de fotografías que se apilan. Las acciones tienen una sombra púrpura suave que se intensifica al pasar el puntero; no es una receta de sombra para todas las superficies. El acceso original conserva bordes negros gruesos y sombras duras desplazadas. Los valores completos de sombra están en `.impeccable/design.json`.

La cinta obtiene profundidad de un bucle, una pasada sombreada azul/índigo
y la continuación del segundo capítulo. Los paneles blancos son planos; los
marcos Polaroid tienen sombra `0 16px 32px rgb(27 16 45 / .16)` para distinguir
sus fotografías superpuestas. El cruce y las sombras son locales al colaje.

## Shapes

Las fotografías tienen esquinas suavemente redondeadas según su función; los posters mantienen su proporción con `object-fit: contain`. Los círculos de enfoque y de contacto son formas deliberadas. El acceso conserva esquinas rectas y bordes contundentes. Las filas de proyectos, áreas y reconocimientos se separan con líneas, sin volverlas tarjetas.

ProjectJourney usa hojas con esquinas superiores amplias (roles del
frontmatter), paneles blancos de radio 16px y acciones de radio 12px.
Los marcos Polaroid tienen esquinas rectas, borde blanco y pie de leyenda;
rotan como piezas completas y conservan los píxeles originales. La cinta
tiene extremos y uniones redondos. La mascota Hito pequeña permanece intacta.

## Components

Las acciones públicas combinan etiqueta en mayúsculas, lavanda, flecha y altura mínima de 52px. En hover aclaran el fondo y desplazan la flecha; el foco público usa un contorno lavanda de 2px con separación de 6px.

El menú usa un `dialog` modal de pantalla completa, enlaces grandes y página activa lavanda; restaura el foco al disparador al cerrar. El selector de proyectos conserva roles de tabs, navegación con flechas, Home y End, y un panel con el poster y su contenido institucional. Los reconocimientos usan `details` y `summary` nativos.

La cabecera fija permanece transparente. En hojas mixtas muestrea por
separado logo, disparador y barras: papel antes que stroke SVG ya dibujado,
blanco sobre cinta y tinta sobre papel. Además comprueba el rectángulo
completo de cada control contra los marcos `data-nav-media`. Mientras un
marco intersecta un control, solo ese control recibe respaldo tinta de radio
8px y margen de 8px, con contenido blanco; el respaldo desaparece al salir.
La prueba de stroke respeta dash visible y opacidad de las capas.

ProjectJourney dibuja y borra la cinta de forma reversible según el progreso
de cada hoja (`start end` a `end end`). El remapeo de dibujo es
`[0, .12, .35, .6, 1]` → `[.0001, .005, .12, .65, 1]`.
Durante el primer .28, su grosor pasa de 44 a 500 unidades en desktop y de
24 a 135 en móvil; son unidades SVG, no píxeles CSS. El primer capítulo usa
el bucle y cruce sombreado; el segundo, su continuación. El colaje se desplaza
de 0 a -45 y -65px y los detalles de viento/avión tienen movimiento leve.
Son SVG geométricos propios y Lucide Send; no se copió runtime Hairline.
Con movimiento reducido los heroes pasan a posición relativa y mínimo 75svh,
la cinta aparece completa y no hay parallax de colaje/detalles. Esta alternativa
tiene evidencia de fuente, sin emulación visual en la revisión actual.

Las fotografías conservan sus originales: JPG 4:3 completo con Next Image y
regiones documentales mediante ventanas CSS. El video local completo de la
reunión usa MP4 H.264/AAC, póster del segundo 1, controles nativos, muted,
playsInline y preload none. No reproduce automáticamente y se pausa fuera
de vista o con documento oculto. Los enlaces fotográficos abren su publicación
institucional. Las acciones púrpuras tienen mínimo 58px; foco de 3px y offset
7px, y solo la flecha se mueve en hover. La cifra de más de 30 universidades
conserva su atribución al brochure de 2024.

HOME sustituye el escaparate de proyectos por información institucional. Sus
cinco áreas usan tabs con foco rotatorio, flechas, Home y End, emblema y panel
asociado; la selección se presenta con mayor opacidad y tono lavanda claro.
Los ejes muestran quince ODS seleccionados, una lámina general y tres grupos
de cinco. Los cuatro controles tienen área de 44px y estado aria-pressed.
La imagen general y los quince iconos son recortes de la página 11 del brochure
2024; la foto del PMI conserva la leyenda histórica de Lima, 2023. El diagrama
de enfoque usa un relleno central local (#8b4c99) para sostener el contraste
de la cabecera durante el zoom; no es un nuevo color de marca.

Las secuencias incluyen fotos insertadas en títulos, historia fijada con fotos apiladas, bandas en sentidos opuestos, círculos que se unen y amplían, texto que pasa de opacidad 0.5 a 1 y cifras en una banda desplazable. La banda permite pausar y también se detiene en hover o foco. El video se reproduce por control del usuario. `prefers-reduced-motion` elimina entradas y desplazamiento continuo, muestra texto plenamente visible y conserva una lectura estática; las transiciones de CSS se reducen a 0.01ms.

Hito conserva sus sprites, rig, arte raster y marcha existentes. En las páginas públicas rediseñadas `greetOnMount={false}` solamente difiere su saludo inicial; no modifica el arte ni la marcha. La mascota animada no se monta en `/login`, donde permanece la ilustración original de bienvenida.

## Do's and Don'ts

### Do:

- **Do** mantener los tokens y estilos públicos dentro de su contenedor y rutas autorizadas.
- **Do** reutilizar el logotipo, fotografías, posters y Hito registrados en la procedencia de recursos.
- **Do** conservar contenido visible, navegación por teclado y alternativas de movimiento reducido.
- **Do** preservar el cuadro de acceso y su tipografía, campos y autenticación existentes.

### Don't:

- **Don't** aplicar este sistema al panel, eventos o Tecnologías de la Información.
- **Don't** reemplazar la identidad de SEDIPRO por los colores, textos o recursos de New Form.
- **Don't** convertir las filas editoriales en una grilla general de tarjetas.
- **Don't** generalizar los cuatro paneles blancos de ProjectJourney: son una excepción local requerida por la composición MindMarket fijada por el usuario.
- **Don't** tratar la referencia como certificación de equivalencia: estas notas describen el código implementado.

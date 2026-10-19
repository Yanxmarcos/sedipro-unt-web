---
name: SEDIPRO UNT — terminal TI
description: Mundo visual exclusivo de la terminal interactiva de Tecnologías de la Información.
colors:
  terminal-orange: "#ff9a45"
  terminal-bright: "#ffb675"
  terminal-muted: "#c88650"
  terminal-line: "#8e4c22"
  terminal-black: "#000"
  frame-black: "#080502"
  portrait-black: "#050302"
  detail-line: "#59331b"
typography:
  body:
    fontFamily: '"Cascadia Code", "Cascadia Mono", Geist Mono, monospace'
    fontSize: "14px"
    fontWeight: 400
  code:
    fontFamily: '"Cascadia Code", "Cascadia Mono", Geist Mono, monospace'
    fontSize: "clamp(12px, 1vw, 16px)"
    fontWeight: 400
    lineHeight: 1.65
  dialog-title:
    fontFamily: '"Cascadia Code", monospace'
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.4
  profile-name:
    fontFamily: '"Cascadia Code", monospace'
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
  navigation:
    fontFamily: '"Cascadia Code", "Cascadia Mono", Geist Mono, monospace'
    fontSize: "12px"
    fontWeight: 400
  frame-label:
    fontFamily: '"Cascadia Code", "Cascadia Mono", Geist Mono, monospace'
    fontSize: "9px"
    fontWeight: 400
    letterSpacing: ".03em"
rounded:
  square: "0"
spacing:
  frame-inset: "8px"
  mobile-inline: "12px"
  dialog-inset: "25px"
  dialog-inset-mobile: "18px"
components:
  terminal-action:
    backgroundColor: "transparent"
    textColor: "{colors.terminal-orange}"
    typography: "{typography.navigation}"
    rounded: "{rounded.square}"
    padding: "5px 0"
  terminal-action-hover:
    textColor: "{colors.terminal-bright}"
  social-link:
    backgroundColor: "transparent"
    textColor: "{colors.terminal-orange}"
    width: "28px"
    height: "28px"
  social-link-hover:
    backgroundColor: "{colors.terminal-orange}"
    textColor: "{colors.terminal-black}"
  profile-frame:
    backgroundColor: "{colors.frame-black}"
    textColor: "{colors.terminal-orange}"
    rounded: "{rounded.square}"
    padding: "{spacing.frame-inset}"
  dialog:
    backgroundColor: "{colors.terminal-black}"
    textColor: "{colors.terminal-orange}"
    rounded: "{rounded.square}"
    padding: "{spacing.dialog-inset}"
---

# Design System: SEDIPRO UNT — terminal TI

## Overview

**Creative North Star: "HackerTyper: construir el equipo con código"**

Una terminal negra y naranja donde cada acción del visitante escribe JavaScript y revela personas reales del área de TI. El usuario fijó expresamente HackerTyper, Cascadia Code, el lienzo inicial vacío y los marcos angulares de retrato. La densidad, el monoespaciado y la geometría tecnológica forman parte de esa elección; no se suavizan para imitar el sitio editorial público.

Este mundo se limita a `/tecnologias-de-la-informacion` y a `src/components/ti-terminal`. La documentación raíz de diseño excluye TI de forma explícita y permanece vigente para sus propias rutas. La paleta y tipografía públicas conservan su alcance; estos tokens no se declaran en `:root`. La estrategia, los hechos y la evidencia de esta superficie están en [su ficha](../../../.impeccable/surfaces/ti-terminal.md).

**Key Characteristics:**

- Negro continuo, código naranja y jerarquía por intensidad del mismo acento.
- Cascadia Code en código, navegación, perfiles y ventanas.
- Retratos reales con recorte angular y revelado ligado a la entrada del visitante.
- Menú español permanente y directorio completo accesible sin completar la interacción.

## Colors

La paleta concentra el contraste en naranja cálido sobre negro; el frontmatter es la referencia normativa de sus valores.

### Primary

- **Naranja terminal** (`terminal-orange`): texto principal, código, controles y borde de las ventanas.
- **Naranja iluminado** (`terminal-bright`): caret, línea de revelado, nombres, títulos y foco visible.
- **Naranja atenuado** (`terminal-muted`): carreras, contadores, pistas y estados de los marcos.
- **Naranja de estructura** (`terminal-line`): contorno de retratos, divisor del menú y scrollbar.
- **Línea de detalle** (`detail-line`): separador de ventana y contornos de redes sociales.

### Neutral

- **Negro terminal** (`terminal-black`): lienzo, menú, ventanas y texto sobre selección naranja.
- **Negro cálido de marco** (`frame-black`): leve separación del retrato frente al lienzo.
- **Negro de retrato** (`portrait-black`): área aún no revelada de la fotografía.

### Named Rules

**The TI Boundary Rule.** Aplicar este mundo únicamente a la ruta TI y a sus componentes; no trasladar sus tokens a la raíz global ni a otras rutas.

## Typography

**Display Font:** Cascadia Code, con Cascadia Mono, Geist Mono y monospace como alternativas de la terminal.

**Body Font:** Cascadia Code; el cuerpo de las ventanas usa monospace como alternativa.

**Character:** Una sola voz monoespaciada une código y contenido institucional. La ruta carga Cascadia Code mediante `next/font/google`, pesos 400, 500 y 600, con `display: swap` y variable `--font-ti-code`; esa variable precede a las alternativas en el CSS.

### Hierarchy

- **Code:** rol `code`, con salto de línea automático, palabras largas partidas y tabulación de dos espacios. En móvil pasa a (12px / 1.6).
- **Title:** rol `dialog-title`; en móvil pasa a (17px).
- **Body:** rol `body`; las ventanas tienen interlínea (1.65) y pasan a (13px) en móvil.
- **Profile name:** rol `profile-name`; el directorio de escritorio lo amplía a (13px). Las carreras usan (11px / 1.45).
- **Label:** rol `frame-label` para `PROFILE_01`, `BUILDING` y `READY`; el menú usa `navigation`, reducido a (11px) en móvil.

## Layout

La terminal ocupa (100dvh), con mínimo de (300px), y forma una columna: lienzo flexible arriba y menú al pie dentro del flujo. El lienzo recorta su desbordamiento. Su estado inicial es una sola columna; con perfiles se divide en código y galería en proporción (1.05fr / 1fr). El código sigue su final y la galería desplaza su propio contenido hacia el perfil nuevo.

La galería usa tres columnas, dos a anchuras de (1000px) o menos. A (600px) o menos el lienzo se apila en filas `minmax(120px,.65fr) minmax(0,1fr)` y muestra únicamente el último perfil generado. El menú móvil usa cuatro columnas y dos filas; Codificar ocupa las dos últimas columnas. El directorio Equipo permanece completo: cuatro columnas de escritorio, tres a (1000px) y dos a (600px).

Las ventanas corrientes miden hasta (570px), con margen lateral de (20px) y alto máximo `calc(100dvh - 70px)`. Equipo amplía el máximo a (1100px). En móvil quedan (12px) por lado y alto máximo `calc(100dvh - 24px)`. El contenido largo desplaza dentro de la ventana.

## Elevation & Depth

No hay sombras ni shader. El contorno naranja y el negro cálido separan los perfiles. Las ventanas nativas se elevan mediante la capa superior de `dialog` y un backdrop negro translúcido (`#000b`); mantienen el mismo negro y no incorporan vidrio ni desenfoque.

El caret parpadea en pasos (1.1s) y queda estático con movimiento reducido. Cada tecla permitida escribe (3) caracteres de inmediato, cancela la cola temporizada pendiente y se detiene cuando cesa la entrada de teclado; escribir más rápido produce código más rápido, como HackerTyper. Rueda, arrastre táctil y Codificar conservan un carácter por tick de `setTimeout`, con intervalo de (30ms), también con movimiento reducido. Esa cola admite hasta (160) caracteres, aproximadamente (4.8s) pendientes; al desmontar se cancela con `clearTimeout`. No existe escritura por inactividad.

## Shapes

Controles y ventanas son cuadrados. Cada perfil recorta dos esquinas opuestas (14px) y lleva una marca naranja superior de (25px × 2px), borde de (1px) y una foto de proporción (4 / 5), que pasa a (1.05) en móvil. La imagen se ajusta con `cover`, centrada arriba, y conserva sus colores originales sin filtro. El naranja permanece en bordes y línea de revelado. El borde del perfil listo cambia al naranja local (`#c57434`); es un estado de este componente, no una segunda paleta global.

## Components

### Buttons

Controles textuales compactos, sin fondo ni borde. El menú comparte el estilo entre enlaces y botones; hover ilumina el texto y lo subraya a (4px). El foco visible de la terminal usa contorno de (2px) y separación de (4px). Codificar añade código y devuelve el foco al lienzo; su icono y los iconos de cierre son auxiliares al texto accesible. No hay campo de comandos ni input simulado.

### Cards / Containers

Los marcos representan integrantes, no categorías de navegación. Aparecen desde la primera entrada y revelan la foto con un recorte vertical y una línea naranja de (1px), proporcional a las líneas escritas: `(líneas completas + fracción de línea actual) / 4`, limitado a uno. Al completar cuatro líneas se muestran foto completa, nombre y enlaces; la secuencia de integrantes y rondas conserva su orden. En el directorio todos están completos desde la apertura. Las redes usan cajas mínimas de (28px × 28px) con borde fino; hover invierte a texto negro sobre naranja. Solo se permiten LinkedIn y GitHub mediante una lista explícita de redes admitidas; los ocho enlaces existentes conservan nombres accesibles por persona y red. Instagram queda excluido también para futuros datos.

### Navigation

Menú persistente: Inicio, Área TI, Funciones, Subáreas, Equipo, Ayuda y Codificar. Inicio vuelve a `/`; los cinco botones informativos abren ventanas nativas. La pista inicial de escritorio dice `SCROLL OR PRESS ANY KEY`; después cambia a `TI / SEDIPRO UNT`. A (1000px) o menos la pista se oculta.

### Dialogs

Ventanas negras con contorno naranja, título iluminado y separación fina. Abren con foco en el cierre; Escape, el botón Cerrar y el backdrop permiten salir. Equipo contiene los 16 perfiles completos. La ventana activa suspende la escritura por teclado y rueda para permitir la lectura y el desplazamiento normal.

### Terminal stream

El lienzo empieza con un caret y sin texto ni perfiles. Las teclas permitidas avanzan directamente tres caracteres; rueda, arrastre táctil y Codificar alimentan la cola temporizada. El código visible es JavaScript significativo en inglés; no ejecuta lo escrito. El estado accesible informa ronda y perfiles construidos sin leer todo el código. La finalización conserva los 16 perfiles hasta la siguiente entrada física; entonces empieza otra ronda y continúa el historial, limitado a (14000) caracteres. El algoritmo recorta por salto de línea cuando puede.

### Named Rules

**The Input Owns Progress Rule.** El código y los perfiles avanzan solo al consumir entrada del visitante; nunca añadir escritura de demostración por tiempo o inactividad.

## Do's and Don'ts

### Do:

- **Do** mantener esta identidad y sus variables dentro de la ruta TI.
- **Do** conservar Cascadia Code, negro y naranja como elección explícita del usuario para TI.
- **Do** mantener el menú español y el directorio completo disponibles desde el inicio.
- **Do** vincular la escritura y el revelado de perfiles a la misma entrada manual.
- **Do** conservar retratos reales, nombres, carreras y enlaces de la fuente de integrantes.

### Don't:

- **Don't** aplicar estos tokens a HOME, proyectos, nosotros, login, panel o eventos.
- **Don't** añadir escritura automática, shader o un campo de comandos ficticio.
- **Don't** ocultar integrantes del directorio Equipo por no haber completado la ronda.
- **Don't** sustituir los marcos angulares ni el monoespaciado por advertencias genéricas contra esos recursos: aquí son decisiones fijadas por el usuario.

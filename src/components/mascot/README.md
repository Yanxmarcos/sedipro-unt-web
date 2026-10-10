# Hito, mascota de SEDIPRO UNT

Hito es un personaje original con acabado suave basado en las seis referencias de
`public/img/hito1.webp` a `hito6.webp`. Sus sprites y su configuración son propios;
no requieren servicios de OpenAI, una cuenta ni una librería de mascotas.

El layout público carga `HitoPet` después del loader y solo en las rutas de
`src/lib/landing-paths.js`. El componente mide 80 × 96 px, empieza en la base
del viewport y admite arrastre libre con ratón o dedo. No bloquea la página
fuera de la mascota y su burbuja.

## Personalizar

- Mensajes y acciones: `hito-messages.js`.
- Arte fuente generado con `imagegen`: `scripts/hito-source/poses-v2.png` y
  `walk-v2.png` y `rig-v4.png`. Los prompts y referencias están en
  `prompts-v2.json` y `prompts-v4.json`.
- Montaje, fotogramas, registro y velocidades: `scripts/generate-hito.mjs`.
- Regenerar WebP y JSON: `npm run mascot:generate`.
- Atlas de gestos, piezas articuladas y manifiesto: `public/img/hito-pet/`.
- Trayectoria del paso y límites de posición: `hito-motion.js`.
- Presentación, burbuja y tamaño: `hito-pet.module.css`. Si cambia el ancho,
  actualizar también las dimensiones de `hito-motion.js`.

Para una nueva página pública, añadir su ruta a `LANDING_PATHS` y un bloque de
mensajes a `HITO_MESSAGES`. También se puede importar `HitoPet` dentro de otro
layout y pasarle `pathname`; sin un bloque específico usa los mensajes de inicio.
Debe montarse dentro del `ReducedMotionProvider` existente.

## Comportamiento

11 animaciones / 68 fotogramas: reposo, caminar, correr, saludar, saltar, pensar,
dormir, celebrar, programar, aletear y dar cariño. Caminar y correr usan un
cuerpo, dos brazos y dos patas independientes: cada pie tiene una fase de apoyo plano
y otra de retorno elevado, desplazadas medio ciclo entre sí. El ritmo depende
de la distancia recorrida; el pie de apoyo compensa el avance del cuerpo para
evitar patinar. Cada pierna articula el muslo morado y el segmento inferior
con dos huesos de longitud fija; la rodilla se encuentra dentro del pantalón.
Los brazos alternan medio ciclo y se balancean en sentido opuesto a la pierna
que avanza, con el brazo lejano detrás del torso y el cercano delante.
La altura se registra a partir de la silueta real de reposo (145 px de textura,
72,5 px visibles), sin cambiar el tamaño del contenedor. Los pies permanecen
cortos, y el cuerpo acompaña los pasos con una oscilación de hasta 0,6 px visibles.
La transición entre reposo y caminata dura 120 ms, sin movimiento adicional
si está pausado, en arrastre o con movimiento reducido. La
dirección izquierda invierte el personaje completo. El atlas anterior conserva
la cadencia de ocho fases como respaldo si la textura articulada no carga.
Las ilustraciones de Hito son propias; los
archivos originales de Fireball se usaron solo como referencia local y no se
distribuyen en esta web. El desplazamiento admite subpíxeles y el canvas de
160 × 192 se presenta a 80 × 96 con suavizado, sin agrandar píxeles en bloques.
Los ojos mantienen la textura del arte original y sus reflejos al seguir el
cursor y parpadear. El personaje se detiene al abrir sus controles.
El arrastre usa Pointer Events y captura del puntero, con un umbral de 6 px
para distinguir un clic. El giro sigue el movimiento horizontal más reciente;
al soltarlo conserva la altura elegida y continúa en esa dirección. Las flechas
lo recolocan con teclado y la tecla Inicio o «Volver a la base» lo devuelven
abajo. La burbuja cambia de lado vertical y limita su altura cuando falta
espacio. Cancelación, pérdida de captura, cambio de pestaña y desmontaje
liberan el gesto.
Los comentarios espontáneos desaparecen y no se anuncian al lector de pantalla;
las respuestas solicitadas sí usan un estado accesible.

Pausa y visibilidad se conservan en `sessionStorage` durante la sesión. La
preferencia de movimiento reducido muestra una pose estática y desactiva el
movimiento automático. Al ocultar la pestaña se cancela el bucle de animación.
El render del canvas se limita a 30 fps. Los originales de generación no se
cargan en el navegador; solo se cargan los dos WebP montados.

## Verificar

`npm run test:hito` reutiliza el servidor de desarrollo de puerto 7000 o lo
inicia. Para otra URL: `HITO_TEST_URL=http://localhost:PUERTO` (usar la sintaxis
de variables de entorno de la terminal). Las pruebas cubren las cuatro rutas,
caminata y bordes, gestos, ojos, pausa, ocultar/restaurar, navegación, movimiento
reducido, arrastre de ratón y táctil, teclado, cancelación, cambio de tamaño
y pantallas móviles de 320 y 390 px.

`npm run test:hito:timing` verifica los límites entre fases y el cierre del
ciclo de respaldo, el apoyo sin deslizamiento, la alternancia de las patas,
el balanceo opuesto de los brazos, la longitud fija de las piernas y los
límites de posición. Las pruebas de navegador también comparan la altura
real de 192 poses de caminar/correr contra reposo y comprueban cambios
visibles en los muslos y brazos, no solo en los pies amarillos.

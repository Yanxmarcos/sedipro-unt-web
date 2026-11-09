# Hito: identidad y preparación de recursos

Regla del usuario: **Hito nunca debe perder sus rasgos originales, deformarse ni
cambiar de colores.** Mantener el criterio utilizado con la mascota de la landing.

## Referencias e invariantes para TODOS los prompts de mejora

- Adjuntar el original de la pose como referencia principal; usar el Hito original
  y la mascota de la landing para comparar identidad cuando haya dudas.
- Mantener rostro, forma de ojos e iris, pico, plumas, orejas, proporciones,
  expresión, pose y colores originales. Respetar el polo y la marca del pecho.
- Mejorar claridad y bordes; no rediseñar ni añadir accesorios, letras o logotipos.
- Para recortes, eliminar únicamente el fondo. No cambiar partes visibles ni
  reconstruir partes ocultas sin revisión explícita de esa nueva versión.
- Conservar las fuentes sin sobrescribirlas y registrar procedencia y prompt.
- Revisar sobre fondos claros, oscuros y de transparencia, además de comparar la
  silueta con el original. Una dimensión mayor no demuestra fidelidad ni detalle.

## Muestra Ejecutivo aprobada

Herramienta: generación/edición de imágenes integrada. Fecha: 2026-11-08.
Fuente: archivo aportado `HITO - Ejecutivo.png`, 1080 × 1080, transparente.
Salida real: 1254 × 1254, transparente. No se anuncia como 4K nativo.
El usuario indicó que la muestra está bien y pidió conservar siempre los rasgos.
Se publica como variante mejorada; el original permanece disponible.

Prompt exacto utilizado:

> EDIT the supplied HITO - Ejecutivo.png, a SEDIPRO UNT institutional owl mascot, as a faithful high-resolution restoration sample. Preserve the EXACT full-body pose with crossed arms, silhouette, facial expression, very large purple irises and eye highlights, beak geometry, purple feathers/body, plain blue polo collar and sleeves, yellow feet and black claws. Keep the same 3D mascot aesthetic and original colors. Do not redesign, add logos or lettering, accessories, props, a floor or cast shadows. Improve the soft/pixelated edges and fine feather/material detail while staying as close as possible to the source; no invented new pose/features. Export the largest supported square resolution, aim for 4096 x 4096, with genuine transparent background (alpha), no white backdrop, no halo or cutout matte. Entire character uncropped with small breathing room. This is a SAMPLE awaiting comparison/approval, not an automatic replacement of the official original.

## Corriendo · recorte sin fondo

Fecha: 2026-11-08. El archivo aportado de 1402 × 1122 era opaco y tenía el negro
incrustado. Se preparó un recorte con alpha mediante la herramienta integrada
de edición de imágenes, conservando el encuadre y las dimensiones reales de
1402 × 1122. El prompt protege pose, rostro, ojos, pico, plumas, polo, marca,
colores y proporciones; pide conservar opacas pupilas, garras y sombras internas
y eliminar solo el fondo, incluidos los huecos entre extremidades y cuerpo.
El prompt exacto y la procedencia se registran en
`scripts/resources/hito-corriendo-recorte.json`.

Entrega: `public/recursos/mejorados/hito-corriendo-sin-fondo-v1.png`. El catálogo
ofrece una sola variante `sin-fondo`, «Sin fondo», calidad «Recorte sin fondo»,
con vista previa versionada. PNG a 4096 y «Archivo original» deben conservar
transparencia; el segundo entrega los bytes del recorte publicado de 1402 × 1122.
Ampliar el recorte no recupera detalle perdido ni lo convierte en 4K nativo.

El original opaco permanece intacto como archivo de referencia en
`public/recursos/originales/hito-corriendo.png`, pero no se lista ni exporta.
Verificar contorno, huecos y partes oscuras sobre fondos claro y oscuro antes de
publicar otro recorte; no confundir fondo negro incrustado con el fondo de
inspección. La revisión independiente acotada `finish-review-corriendo.md` emitió
`ship` sin hallazgos materiales; comparó la fuente, el recorte, los dos controles
y las cuatro capturas de galería/detalle. Confirmó por SHA-256 la fuente archivada
intacta y alpha real en el recorte. La comprobación visual de identidad no afirma
igualdad de píxeles del personaje tras una edición generativa.

## Muestra de captura con cámara

Preparada aparte en la carpeta local de revisión. No se incorpora automáticamente
al catálogo: el tratamiento de la captura introduce diferencias en detalles de
la cámara y de las manos que deben resolverse antes de aprobarla como recurso.

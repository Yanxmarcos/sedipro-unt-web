# SEO de SEDIPRO UNT

## Identidad y alcance

- Dominio canónico: https://sediprount.org.
- Título de inicio: **SEDIPRO UNT | Sección Estudiantil de Dirección de Proyectos de la UNT**.
- Nombre completo: Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo.
- Se optimizan las ocho páginas públicas existentes. No se crean páginas de áreas ni rutas de contenido adicionales.
- No se cambian DNS, el dominio de Vercel, cuentas de Google ni el despliegue mediante este trabajo local.

## Problemas encontrados en producción

La comprobación HTTP del dominio encontró que Inicio, Nosotros y Proyectos compartían canonical y og:url del inicio. Esto enviaba señales contradictorias sobre cuáles eran páginas distintas. El dominio respondía 404 a /sitemap.xml; robots.txt tenía grupos específicos para Googlebot y Bingbot que no heredaban las restricciones del grupo general. La vista previa utilizaba la imagen antigua og-image.webp.

## Implementación

- src/lib/seo.mjs centraliza títulos, descripciones, URLs canónicas y Open Graph/Twitter para las ocho páginas. Las dimensiones de la imagen son reales: 1672 × 941.
- public/social/sedipro-unt-seo.jpg conserva la composición completa del PNG que entregó el propietario. La codificación JPEG ocupa 245058 bytes frente a 2313853 bytes del original, sin recortar la ilustración. El original de Descargas no se modifica.
- src/app/sitemap.js publica únicamente URLs canónicas públicas. No inventa fechas de actualización ni incluye formularios, sesiones, votos o el panel.
- src/app/robots.js publica una política común y enlaza el sitemap. Permite rastrear las páginas privadas para que los buscadores puedan leer noindex; las APIs y rutas administrativas no públicas se excluyen del rastreo. Robots no sustituye autenticación.
- Los layouts internos emiten noindex, nofollow. next.config.mjs también envía X-Robots-Tag para rutas internas y APIs. El panel conserva su autenticación y redirección al login; su código cliente se trasladó íntegro a components/admin/panel-layout.jsx para dejar los metadatos en un layout servidor.
- Las compilaciones de Vercel con VERCEL_ENV diferente de production emiten noindex, bloquean rastreo y dejan el sitemap vacío. Comprobar esa variable antes de publicar producción.
- components/seo/structured-data.jsx emite JSON-LD de Organization, WebSite, WebPage/AboutPage/CollectionPage, BreadcrumbList y el listado de proyectos donde corresponde. Usa nombres, áreas, correo y redes existentes; no añade valoraciones, reseñas ni premios inventados. La salida escapa los caracteres '<'.
- Google Site Verification y Bing admiten tokens de etiqueta HTML mediante variables de entorno opcionales documentadas en .env.example. No colocar contraseñas ni credenciales en estas variables.

## Publicar y conectar Google Search Console

1. Publicar estos cambios en el proyecto de Vercel asociado a sediprount.org, en el entorno Production. La configuración local no modifica por sí sola la versión publicada.
2. Comprobar que https://sediprount.org/sitemap.xml y https://sediprount.org/robots.txt responden 200, y que la portada está disponible sin login ni noindex.
3. Abrir https://search.google.com/search-console/ y añadir una propiedad de tipo **Dominio** con sediprount.org, sin https ni rutas.
4. Copiar el registro TXT que Google entregue y añadirlo en el proveedor que gestione los DNS autoritativos. Si los nameservers pertenecen a Vercel, se añade en los DNS del dominio de Vercel; si pertenecen al registrador u otro proveedor, se añade allí. No reemplazar los registros A, CNAME, MX ni otros TXT existentes.
5. Verificar la propiedad en Search Console y conservar el TXT. No es necesario cambiar el código para este método.
6. En **Sitemaps**, enviar https://sediprount.org/sitemap.xml una vez que esté publicado.
7. En **Inspección de URLs**, comprobar y solicitar indexación de Inicio, Nosotros y Proyectos. No enviar las rutas noindex del panel, login o formularios internos.
8. Supervisar **Indexación de páginas**, canonical elegido por Google, consultas e impresiones en **Rendimiento**, y **Métricas web principales**. Esperar a que Google vuelva a rastrear; reenviar la misma URL repetidamente no acelera el proceso.

Alternativa para propiedad de **Prefijo de URL**: usar https://sediprount.org/ y el método **Etiqueta HTML**. Copiar solo el valor content del token a GOOGLE_SITE_VERIFICATION en Vercel y volver a desplegar. Este método no verifica una propiedad de Dominio.

## Vista previa de WhatsApp

Open Graph entrega la nueva imagen JPEG mediante una URL HTTPS absoluta, con título, descripción, tipo, dimensiones y texto alternativo. La imagen se publica bajo una URL nueva para no reutilizar la del recurso anterior. Los metadatos están presentes en HTML de servidor; WhatsApp no necesita ejecutar React para leerlos.

Después de publicar, compartir la URL canónica desde un chat propio. WhatsApp y otras plataformas pueden conservar temporalmente la vista previa antigua; el código no controla sus cachés ni garantiza un recorte idéntico en todas las versiones de las aplicaciones. Meta Sharing Debugger puede ayudar a revisar el HTML y actualizar la caché de Facebook, pero no garantiza actualizar inmediatamente la de WhatsApp.

## Comprobación repetible

Con el servidor local disponible:

```powershell
npm run seo:audit
```

Después de publicar en producción:

```powershell
npm run seo:audit -- https://sediprount.org
```

La auditoría valida HTTP 200 en las ocho páginas, títulos, descripciones, canonical único por URL, og:url, imagen y dimensiones, tarjeta social, JSON-LD válido, noindex en rutas internas y redirecciones autenticadas, 404 real, sitemap y robots. Comprueba el HTML recibido con un User-Agent de WhatsApp/Googlebot, sin depender de la hidratación del navegador. No mide rankings, Core Web Vitals de usuarios reales ni certifica indexación en Google.

## Validación de esta entrega

- Compilación de producción: PASS (Next.js 16.2.2). Aviso preexistente: Next no dispone de métricas de fallback para Cascadia Code; la fuente original de la terminal se conserva.
- ESLint de archivos SEO y layouts modificados: sin errores.
- Auditoría HTTP contra desarrollo en localhost:7000: PASS.
- Auditoría HTTP contra la compilación de producción en localhost:7100: PASS. El servidor temporal se cerró al terminar.
- Ocho rutas públicas con título, descripción, canonical, Open Graph, Twitter y JSON-LD correctos. Cinco rutas internas con noindex en HTML y cabecera; dos rutas protegidas siguen respondiendo 307 al login con cabecera noindex.
- Sitemap con ocho URLs; robots accesible; ruta inexistente con estado 404 y noindex; imagen JPEG accesible de 245058 bytes.
- Comprobación de la rama VERCEL_ENV=preview y cabeceras noindex: PASS.
- El dominio publicado aún requiere desplegar estos cambios y repetir la auditoría con npm run seo:audit -- https://sediprount.org. Estos resultados no acreditan un despliegue, una vista previa de WhatsApp ya recargada ni indexación en Google.

## Expectativas y siguientes acciones

No se puede prometer el primer puesto ni una fecha de indexación. Los enlaces de sitio debajo de un resultado son automáticos: títulos claros, enlaces internos y estructura coherente ayudan, pero su aparición depende de Google. Mantener actualizado el contenido de proyectos y conseguir enlaces legítimos desde la UNT, organizaciones colaboradoras y los perfiles oficiales refuerza las señales de identidad del sitio.

Fuentes oficiales:

- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls?hl=es
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=es
- https://support.google.com/webmasters/answer/9008080?hl=es
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=es
- https://developers.google.com/search/docs/appearance/sitelinks?hl=es
- https://nextjs.org/docs/app/api-reference/functions/generate-metadata

# Sitio web de SEDIPRO UNT

Sitio web para la **Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo**, un equipo multidisciplinario que forma futuros líderes mediante las buenas prácticas de gestión de proyectos, la metodología PMI y herramientas ágiles, con un enfoque académico, social y ambiental.

Desde el **área de Tecnologías de la Información (TI)** desarrollamos y mantenemos este sitio web para conectar a nuestra comunidad y apoyar las iniciativas de SEDIPRO UNT.

## Generador de certificados

El panel incluye **Herramientas → Certificados → Generador de certificados**, en
`/panel/certificados`. Usa los mismos permisos de gestión del panel: Directiva,
Administrador y Superadministrador. Mantiene el inicio de sesión existente.

- Diseño integrado al tema claro/oscuro y al menú del panel.
- Vista previa en tiempo real con la plantilla original de SEDICHAMPIONS.
- Descarga individual en PDF A4 horizontal y PNG; el nombre se ajusta a su espacio.
- Importación de Excel `.xlsx` y `.xls`, con plantilla descargable, validación por
  fila y revisión de cada participante antes de descargar el lote de PDF en ZIP.
- Hasta 500 participantes y 10 MB por Excel. Se lee la primera hoja. Los
  encabezados son **Nombre, Rol, Área y Fecha** (también se reconocen variantes
  como Nombre completo, Cargo y Lugar y fecha). Se conserva el texto de Fecha;
  las celdas de fecha de Excel se convierten a una fecha en español.
- Los datos se procesan en el navegador. No se agrega una base de datos de
  certificados ni se transmiten los Excel al servidor.

Para ejecutar el proyecto, instala las dependencias actualizadas:

```bash
npm ci
npm run dev
```

Abre `http://localhost:7000`, inicia sesión y entra al submenú de Certificados.
Conserva la configuración de tu backend en `.env.local` según `.env.example`;
el ZIP contiene el frontend, y el acceso al panel utiliza el backend existente.
No se necesita ningún servicio adicional para generar certificados.

La plantilla del certificado está en
`public/certificados/plantilla-sedichampions.png`; el editor está en
`src/components/admin/certificates/` y la lógica de dibujo/importación en
`src/lib/certificates.mjs`. La plantilla conserva sus logos y firmas originales,
y corresponde al proyecto SEDICHAMPIONS. No es un editor de diseños arbitrarios.

Pruebas de datos y permisos del módulo:

```bash
node --test tests/certificates/data.test.mjs
```

## Contributors

- [Yanxmarcos Chan Vasquez](https://github.com/Yanxmarcos)

<!-- Espacio reservado para incorporar a los próximos colaboradores. -->

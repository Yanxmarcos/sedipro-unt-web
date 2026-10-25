# Sitio web de SEDIPRO UNT

Sitio web para la **Sección Estudiantil de Dirección de Proyectos de la Universidad Nacional de Trujillo**, un equipo multidisciplinario que forma futuros líderes mediante las buenas prácticas de gestión de proyectos, la metodología PMI y herramientas ágiles, con un enfoque académico, social y ambiental.

Desde el **área de Tecnologías de la Información (TI)** desarrollamos y mantenemos este sitio web para conectar a nuestra comunidad y apoyar las iniciativas de SEDIPRO UNT.

## Generador de certificados

El panel incluye **Herramientas → Certificados**, en
`/panel/certificados`. Está disponible para todos los roles del panel, incluido
Sediprano. Mantiene el inicio de sesión existente y los permisos de gestión del padrón.

1. Elige **Sedipranos** o **Participantes externos** e indica proyecto y año del
   periodo. Para Sedipranos, selecciona personas del padrón como dirección de
   proyecto, coordinación o asesoría, o importa un Excel. Una persona tiene un
   solo rol en el lote. Para externos, importa Excel, carga las inscripciones
   confirmadas de un evento (incluidas sus páginas) o añade personas manualmente.
2. Carga tu fondo PNG, JPEG o WebP de hasta 10 MB, con espacio libre para los
   textos y las firmas. El diseño base descargable es una referencia aportada
   por el usuario; debes cargar la imagen que deseas utilizar.
3. Configura los firmantes y carga sus firmas visibles con fondo transparente,
   PNG o WebP de hasta 4 MB. En certificados de dirección de proyecto firman
   presidencia y dirección de PMO del periodo; en los demás de Sedipranos,
   presidencia y todas las personas de dirección del proyecto. Los externos
   admiten firmantes personalizados o ningún firmante.
4. Revisa la vista previa junto al editor. Ajusta fuentes, tamaños y posiciones
   con los controles o un clic en la vista previa; el nombre se conserva en una
   línea y las variables del texto se dibujan en negrita. El texto de externos
   es editable y admite `{nombre}`, `{rol}`, `{area}` y `{proyecto}`; exige
   `{rol}` y `{proyecto}`.
5. Descarga el certificado actual en PDF A4 o PNG, o un ZIP de PDF o PNG de todos,
   una selección o un rango. Los archivos usan el nombre completo con sufijos
   para evitar colisiones. El PDF conserva la proporción del diseño dentro de
   A4 y elige la orientación según la imagen.

Las plantillas Excel están en `public/certificados/plantilla-sedipranos.xlsx`
(**Nombre, Rol, Área**) y `public/certificados/plantilla-externos.xlsx`
(**Nombre, Rol**). Incluyen ejemplos ficticios distintos y una hoja
**Instrucciones**. Se procesa la primera hoja de `.xlsx` o `.xls`: máximo
500 participantes y 10 MB por archivo. Para Sedipranos, escribe el rol como
Director/Directora, Coordinador/Coordinadora o Asesor/Asesora. Se admiten hasta
siete personas en dirección de proyecto y ocho firmantes por certificado.
El lote se detiene si sus archivos generados superan 250 MB; usa un rango menor.

Antes de emitir certificados internos, configura las personas existentes en
**Padrón de sedipranos** (`/panel/sedipranos`): sexo/tratamiento y, para las
personas del área Directiva, cargo institucional, área que dirigen y año
del periodo. Presidencia y PMO se buscan entre cuentas y personas activas con
el cargo y año exactos; nunca se deducen por el nombre. Si falta el tratamiento,
el generador pide elegirlo. Cada ficha conserva una única asignación
institucional vigente; no hay historial de directivas por año.

La lista de trabajo, los Excel importados, fondos, firmas y ajustes se mantienen
en memoria del navegador y se pierden al cerrar o reiniciar la sesión del
generador. No existe almacenamiento ni endpoint de escritura de certificados.
El inicio de sesión y las consultas de padrón y eventos utilizan el backend
existente; guardar cambios en una ficha del padrón sí persiste sus metadatos.
El generador consulta `GET /api/certificados/sedipranos`, una vista de solo lectura
para todos los roles del panel con nombres, foto, área, tratamiento y cargos del
período. Excluye DNI, contactos, claves de imágenes y datos administrativos de cuentas.

Para ejecutar el proyecto, instala las dependencias actualizadas:

```bash
npm ci
npm run dev
```

Abre `http://localhost:7000`, inicia sesión y entra a Certificados.
Conserva la configuración de tu backend en `.env.local` según `.env.example`;
el acceso al panel utiliza el backend existente.
No se necesita ningún servicio adicional para generar certificados.

El editor está en `src/components/admin/certificates/`; la lógica de datos e
importación en `src/lib/certificate-data.mjs` y el dibujo/exportación en
`src/lib/certificate-renderer.mjs`. El ejemplo Crown Night de 2000 × 1414 está
en `public/certificados/plantilla-base.png`, copiado sin alterar del PNG del
usuario. `public/certificados/plantilla-sedichampions.png` y
`src/lib/certificates.mjs` se conservan por compatibilidad; el segundo aún
provee utilidades de fecha.

Pruebas locales de datos, permisos y renderizado del módulo:

```bash
node --test tests/certificates/data.test.mjs tests/certificates/renderer.test.mjs
npm run build
```

Las pruebas de certificados de `tests/certificates/` están presentes localmente,
pero la regla actual `/tests/*` de `.gitignore` las excluye del control de
versiones. Un checkout nuevo necesita esos archivos para ejecutar ese comando.
El backend dispone además de `node --test tests/member-metadata.test.mjs` desde
su propia carpeta.

## Contributors

- [Yanxmarcos Chan Vasquez](https://github.com/Yanxmarcos)

<!-- Espacio reservado para incorporar a los próximos colaboradores. -->

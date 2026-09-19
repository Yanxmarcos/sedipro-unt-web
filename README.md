Aplicación web para contabilizar asistencias y votaciones de miembros de Sedipro UNT.
# sedipro-asistencia-app

## Eventos e inscripciones externas

El módulo **Eventos** mantiene separados a los miembros internos de SEDIPRO y a los participantes externos. Incluye formulario público, reutilización de personas por correo/DNI, importación de CSV/XLSX de Google Forms, QR seguro y check-in manual o por QR.

### Formato de importación

La primera fila debe contener encabezados. Son obligatorios `Nombres`, `Apellidos` y `Correo electrónico` (también se reconocen `Nombre`, `Apellido`, `Correo`, `Email`). Opcionalmente se reconocen `DNI`, `Celular`, `Organización` y `Universidad`.

### Google Sheets

Para que el botón **Crear hoja del evento** cree y sincronice una hoja, configura estas variables únicamente en el servidor:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=cuenta-servicio@proyecto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
```

La cuenta de servicio será propietaria de las hojas. Comparte la hoja creada con las cuentas de la directiva desde Google Sheets. Nunca publiques estas credenciales en el repositorio ni en variables expuestas al navegador.

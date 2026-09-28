# SEDIPRO UNT — Frontend

Sitio público y panel interno de SEDIPRO UNT, construido con Next.js 16.2.2.
El navegador se comunica únicamente con las rutas `/api/*` de este proyecto;
el proxy del servidor reenvía cada petición al backend independiente.

## Desarrollo local

1. Inicia el backend en `http://localhost:6001`.
2. Copia `.env.example` como `.env.local`.
3. Instala las dependencias con `npm install`.
4. Ejecuta `npm run dev` y abre `http://localhost:7000`.

## Comandos

```bash
npm run dev
npm run build
npm run lint
npm run test:panel
```

Las pruebas de Playwright y su configuración sí forman parte del repositorio.
Los resultados generados en `test-results`, `playwright-report` y `coverage` se
ignoran porque se recrean en cada ejecución.

## Variables de entorno

| Variable       | Uso                                                         |
| -------------- | ----------------------------------------------------------- |
| `API_BASE_URL` | Origen privado del backend usado por el proxy del servidor. |

En producción configura `API_BASE_URL=https://api-sediprount.vercel.app` en
Vercel. La URI de MongoDB, el secreto JWT y el token de UploadThing pertenecen
exclusivamente al backend.

## Despliegue en Vercel

1. Importa este repositorio y deja **Root Directory** en `.`.
2. Conserva la detección automática de Next.js.
3. Configura `API_BASE_URL=https://api-sediprount.vercel.app` en Production y
   Preview.
4. Despliega y vincula el dominio `sediprount.org`.

Antes de publicar ejecuta:

```bash
npm ci
npm run lint
npm run build
```

`TEMPLATE-LICENSE.md` contiene la licencia MIT de la plantilla usada como base
del panel y debe permanecer en el repositorio.

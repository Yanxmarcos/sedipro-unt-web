import { test, expect } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const id = "1234567890abcdef12345678";
const summary = {
  perfil: { nombres: "ANA MARÍA", area: "PMO" },
  eventos: [
    {
      _id: id,
      titulo: "Taller de proyectos",
      fechaInicio: "2026-12-01T15:00:00.000Z",
      modalidad: "virtual",
      lugar: "Google Meet",
    },
  ],
  enlaces: [
    {
      _id: id,
      titulo: "Inscripciones del taller",
      urlCorta: "https://sediprount.org/fm/9xz",
      estadoEfectivo: "activo",
    },
  ],
};
async function setup(
  page,
  {
    role = "SEDIPRANO",
    empty = false,
    error = false,
    assignmentsError = false,
    area = "PMO",
    assignmentDescription = "Reunión del área PMO",
  } = {},
) {
  const calls = [];
  await page
    .context()
    .addCookies([
      { name: "auth_token", value: "test-only", url: "http://127.0.0.1:7012" },
    ]);
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    calls.push(path);
    if (path === "/api/mi/asistencias" && assignmentsError)
      return route.fulfill({ status: 503, json: { error: "No disponible" } });
    let body = { data: [] };
    if (path === "/api/auth/verify")
      body = {
        authenticated: true,
        user: {
          id,
          nombres: "ANA MARÍA",
          apellidos: "QA",
          rol: role,
          sedipranoId: id,
        },
        session: {
          serverNow: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
      };
    if (path === "/api/mi/asistencias")
      body = {
        data: empty
          ? []
          : [
              {
                _id: id,
                descripcion: assignmentDescription,
                fecha: "2026-12-02T15:00:00.000Z",
              },
            ],
      };
    if (path === "/api/mi/resumen") {
      if (error)
        return route.fulfill({
          status: 503,
          json: {
            error: "No se pudo cargar tu resumen. Inténtalo nuevamente.",
          },
        });
      body = {
        data: empty ? { ...summary, eventos: [], enlaces: [] } : summary,
      };
      body.data = { ...body.data, perfil: { ...body.data.perfil, area } };
    }
    if (path === "/api/mi/votaciones")
      body = {
        data: empty
          ? []
          : [
              {
                _id: "pending",
                titulo: "Decisión del equipo",
                eligible: true,
                yaVoto: false,
                fechaCierre: "2026-12-03T15:00:00.000Z",
              },
              {
                _id: "cast",
                titulo: "Consulta finalizada para ti",
                eligible: true,
                yaVoto: true,
              },
              {
                _id: "ineligible",
                titulo: "Otra consulta",
                eligible: false,
                yaVoto: false,
                motivo: "Debes figurar como presente o con tardanza.",
              },
            ],
      };
    if (path === "/api/dashboard") body = managementFixture;
    if (path === "/api/dashboard/actividad")
      body = { data: [], pagination: { page: 1, pages: 1, total: 0 } };
    await route.fulfill({ status: 200, json: body });
  });
  return calls;
}

// Synthetic management data, independent of the user's MongoDB.
test("T-017 fix member totals and administrator filter preserve real roles; link clicks refresh", async ({
  page,
}) => {
  test.setTimeout(180000);
  await setup(page, { role: "SUPERADMINISTRADOR" });
  const members = [
    {
      _id: "1234567890abcdef12345671",
      nombres: "ANA",
      apellidos: "ACTIVA",
      dni: "11111111",
      area: "GTH",
      activo: true,
      account: {
        id: "1234567890abcdef12345681",
        rol: "SEDIPRANO",
        active: true,
      },
    },
    {
      _id: "1234567890abcdef12345672",
      nombres: "MARCOS",
      apellidos: "PRUEBA",
      dni: "22222222",
      area: "TI",
      activo: true,
      account: {
        id: "1234567890abcdef12345682",
        rol: "SUPERADMINISTRADOR",
        active: true,
      },
    },
    {
      _id: "1234567890abcdef12345673",
      nombres: "LUIS",
      apellidos: "INACTIVO",
      dni: "33333333",
      area: "PMO",
      activo: false,
      account: {
        id: "1234567890abcdef12345683",
        rol: "ADMINISTRADOR",
        active: false,
      },
    },
  ];
  await page.route("**/api/sedipranos", (route) =>
    route.fulfill({ json: { data: members } }),
  );
  let clicks = 1234;
  await page.route("**/api/enlaces?**", (route) =>
    route.fulfill({
      json: {
        data: [
          {
            _id: id,
            titulo: "Enlace con clics QA",
            prefijo: "fm",
            tipoDestino: "formulario",
            urlCorta: "https://sediprount.org/fm/9xz",
            urlDestino: "https://forms.gle/example",
            dominioDestino: "forms.gle",
            estadoEfectivo: "activo",
            estado: "activo",
            creadorNombre: "Ana QA",
            createdAt: "2026-11-01T15:00Z",
            revision: 0,
            clics: clicks,
          },
          {
            _id: "1234567890abcdef12345670",
            titulo: "Enlace anterior QA",
            prefijo: "ig",
            tipoDestino: "publicacion",
            urlCorta: "https://sediprount.org/ig/2rs",
            urlDestino: "https://www.instagram.com/sediprount",
            dominioDestino: "www.instagram.com",
            estadoEfectivo: "activo",
            estado: "activo",
            creadorNombre: "Ana QA",
            createdAt: "2026-11-01T15:00Z",
            revision: 0,
          },
        ],
        pagination: { page: 1, pages: 1, total: 2 },
      },
    }),
  );
  await mkdir(".impeccable/review/t-017-fix", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ["light", "dark"]) {
      await page.addInitScript(
        (value) => localStorage.setItem("theme", value),
        theme,
      );
      await page.goto("/panel/sedipranos");
      await expect(
        page.getByText("MARCOS PRUEBA", { exact: true }),
      ).toBeVisible();
      const stats = page.locator('[data-slot="card-content"] p');
      expect((await stats.allTextContents()).slice(0, 6)).toEqual([
        "Activos",
        "2",
        "Inactivos",
        "1",
        "Total registrados (activos e inactivos)",
        "3",
      ]);
      await page.getByRole("combobox", { name: "Filtrar por rol" }).click();
      await expect(
        page.getByRole("option", { name: "Superadministrador", exact: true }),
      ).toHaveCount(0);
      await page
        .getByRole("option", { name: "Administrador", exact: true })
        .click();
      await expect(
        page.getByText("MARCOS PRUEBA", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("LUIS INACTIVO", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("ANA ACTIVA", { exact: true })).toHaveCount(
        0,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `.impeccable/review/t-017-fix/members-${width}-${theme}.png`,
        fullPage: true,
        animations: "disabled",
      });
      await page.goto("/panel/enlaces");
      await expect(
        page.getByRole("columnheader", { name: "Clics", exact: true }),
      ).toBeVisible();
      const counted = page
        .getByRole("row")
        .filter({ hasText: "Enlace con clics QA" });
      const previous = page
        .getByRole("row")
        .filter({ hasText: "Enlace anterior QA" });
      await expect(
        counted.getByRole("cell", {
          name: new Intl.NumberFormat("es-PE").format(clicks),
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        previous.getByRole("cell", { name: "0", exact: true }),
      ).toBeVisible();
      await page
        .getByRole("columnheader", { name: "Clics", exact: true })
        .scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `.impeccable/review/t-017-fix/links-${width}-${theme}.png`,
        fullPage: true,
        animations: "disabled",
      });
      clicks++;
      await page
        .getByRole("button", { name: "Actualizar", exact: true })
        .click();
      await expect(
        counted.getByRole("cell", {
          name: new Intl.NumberFormat("es-PE").format(clicks),
          exact: true,
        }),
      ).toBeVisible();
    }
  }
});

const managementFixture = {
  comunidad: {
    total: 104,
    areas: [
      ["TI", 15],
      ["PMO", 17],
      ["LTK Y FNZ", 22],
      ["GTH", 22],
      ["MKT", 21],
      ["DIRECTIVA", 7],
    ].map(([area, total]) => ({ area, total })),
  },
  asistencia: {
    presente: 250,
    tardanza: 63,
    justificado: 32,
    ausente: 366,
    convocatorias: 711,
    sesiones: 8,
    enRegistro: 2,
    historicas: 8,
    porcentaje: 44,
    puntualidad: 79.9,
    variacion: 5.3,
    areasActualesEnHistoricos: 500,
    areas: ["TI", "PMO", "GTH", "MKT", "LTK Y FNZ", "DIRECTIVA"].map(
      (area) => ({ area, porcentaje: 44, asistentes: 44, convocatorias: 100 }),
    ),
  },
  votaciones: { activas: 1, votos: 44, habilitados: 76, porcentaje: 57.9 },
  evolucion: ["04", "05", "06", "07", "08", "09", "10"].map((month, i) => ({
    month: `2026-${month}`,
    porcentaje: 35 + i * 4,
    asistentes: 35 + i * 4,
    convocatorias: 100,
  })),
  externos: { eventos: 0, inscritos: 0, asistentes: 0, proximos: [] },
  herramientas: {
    enlacesActivos: 3,
    descargasCertificados: 5,
    certificadosGenerados: 34,
  },
  pendientes: { asistenciasSinEncargado: 2 },
};

test("ERP enhancements dashboard distributions filter current active membership by area", async ({
  page,
}) => {
  test.setTimeout(180000);
  await setup(page, { role: "SUPERADMINISTRADOR" });
  const areas = ["TI", "PMO", "LTK Y FNZ", "GTH", "MKT", "DIRECTIVA"];
  const counts = { TI: 3, PMO: 1, GTH: 2 };
  const group = (area) => ({
    area,
    total: area ? counts[area] || 0 : 6,
    sinCarrera: area === "PMO" || !area ? 1 : 0,
    carreras:
      area === "TI"
        ? [
            { carrera: "INGENIERÍA DE SISTEMAS", cantidad: 2 },
            { carrera: "DERECHO", cantidad: 1 },
          ]
        : area === "GTH"
          ? [
              {
                carrera:
                  "EDUCACIÓN SECUNDARIA: MENCIÓN EN CIENCIAS NATURALES, FÍSICA, QUÍMICA Y BIOLOGÍA",
                cantidad: 1,
              },
              { carrera: "MEDICINA", cantidad: 1 },
            ]
          : area
            ? []
            : [
                { carrera: "INGENIERÍA DE SISTEMAS", cantidad: 2 },
                { carrera: "DERECHO", cantidad: 1 },
                {
                  carrera:
                    "EDUCACIÓN SECUNDARIA: MENCIÓN EN CIENCIAS NATURALES, FÍSICA, QUÍMICA Y BIOLOGÍA",
                  cantidad: 1,
                },
                { carrera: "MEDICINA", cantidad: 1 },
              ],
    sexos: [
      {
        sexo: "MASCULINO",
        cantidad: area === "TI" ? 2 : area === "GTH" ? 1 : area ? 0 : 3,
      },
      {
        sexo: "FEMENINO",
        cantidad: area === "TI" || area === "GTH" ? 1 : area ? 0 : 2,
      },
      { sexo: "NO_ESPECIFICADO", cantidad: area === "PMO" || !area ? 1 : 0 },
    ],
  });
  await page.route("**/api/dashboard?**", (route) =>
    route.fulfill({
      json: {
        ...managementFixture,
        comunidad: {
          total: 6,
          areas: areas.map((area) => ({ area, total: counts[area] || 0 })),
          distribuciones: ["", ...areas].map(group),
        },
      },
    }),
  );
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mkdir(".impeccable/review/erp-enhancements", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ["light", "dark"]) {
      await page.addInitScript(
        (value) => localStorage.setItem("theme", value),
        theme,
      );
      await page.goto("/panel");
      const section = page.getByRole("region", {
        name: "Distribución del padrón activo",
        exact: true,
      });
      await expect(
        section.getByRole("heading", { name: "Distribución por carrera" }),
      ).toBeVisible();
      await expect(
        section
          .getByRole("table", {
            name: "Cantidad de sedipranos por carrera",
            exact: true,
          })
          .getByRole("row"),
      ).toHaveCount(5);
      await expect(
        section.getByRole("table", {
          name: "Cantidad de sedipranos por sexo",
          exact: true,
        }),
      ).toContainText("Sin especificar");
      await expect(
        section.locator('[data-slot="chart"] .recharts-bar').first(),
      ).toBeVisible();
      const contrasts = await section.evaluate((element) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d");
        const luminance = (color) => {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          const values = [...context.getImageData(0, 0, 1, 1).data]
            .slice(0, 3)
            .map((value) => {
              const channel = value / 255;
              return channel <= 0.04045
                ? channel / 12.92
                : ((channel + 0.055) / 1.055) ** 2.4;
            });
          return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
        };
        return [
          ...element.querySelectorAll(".recharts-cartesian-axis-tick-value"),
        ].map((tick) => {
          const foreground = luminance(getComputedStyle(tick).fill);
          const background = luminance(
            getComputedStyle(tick.closest('[data-slot="card"]'))
              .backgroundColor,
          );
          return (
            (Math.max(foreground, background) + 0.05) /
            (Math.min(foreground, background) + 0.05)
          );
        });
      });
      expect(contrasts.length).toBeGreaterThan(0);
      for (const contrast of contrasts)
        expect(contrast).toBeGreaterThanOrEqual(4.5);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({
        path: `.impeccable/review/erp-enhancements/summary-${width}-${theme}.png`,
        fullPage: true,
        animations: "disabled",
      });
      const filters = section.getByRole("group", {
        name: "Área de la distribución",
      });
      await filters.getByRole("button", { name: "TI", exact: true }).click();
      await expect(
        filters.getByRole("button", { name: "TI", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      const table = section.getByRole("table", {
        name: "Cantidad de sedipranos por carrera",
        exact: true,
      });
      await expect(table.getByRole("row")).toHaveCount(3);
      await expect(table).not.toContainText("MEDICINA");
      await filters.getByRole("button", { name: "PMO", exact: true }).click();
      await expect(
        section.getByText("Sin carreras para mostrar", { exact: true }),
      ).toBeVisible();
      await expect(
        section.getByRole("table", {
          name: "Cantidad de sedipranos por sexo",
          exact: true,
        }),
      ).toContainText("Sin especificar");
      await filters.getByRole("button", { name: "MKT", exact: true }).click();
      await expect(
        section.getByText("Sin integrantes para mostrar", { exact: true }),
      ).toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});

test("ERP enhancements attendance filters preserve the full roster when editing and saving", async ({
  page,
}) => {
  test.setTimeout(180000);
  await setup(page, { role: "DIRECTIVA" });
  let rows = ["presente", "tardanza", "justificado", "ausente"].map(
    (estado, index) => ({
      sedipranoId: `1234567890abcdef1234567${index}`,
      estado,
      sediprano: {
        nombres: ["ANA", "BRUNO", "CARLA", "DIEGO"][index],
        apellidos: "QA",
        dni: `1111111${index}`,
        area: "TI",
      },
    }),
  );
  const writes = [];
  await page.route(`**/api/asistencias/${id}`, async (route) => {
    if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON();
      writes.push(body);
      rows = rows.map((row) => ({
        ...row,
        estado: body.registro.find(
          (value) => value.sedipranoId === row.sedipranoId,
        ).estado,
      }));
    }
    return route.fulfill({
      json: {
        asistencia: {
          _id: id,
          descripcion: "Reunión de coordinación QA",
          fecha: "2026-11-05T05:00Z",
          estadoRegistro: "en_registro",
          registro: rows,
        },
      },
    });
  });
  await mkdir(".impeccable/review/erp-enhancements", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ["light", "dark"]) {
      await page.addInitScript(
        (value) => localStorage.setItem("theme", value),
        theme,
      );
      await page.goto(`/panel/asistencias/${id}?mode=view`);
      const filters = page.getByRole("group", {
        name: "Filtrar asistencia por estado",
      });
      await filters
        .getByRole("button", { name: "Tardanzas 1", exact: true })
        .click();
      await expect(page.locator("tbody tr")).toHaveCount(1);
      await expect(page.getByText("BRUNO QA", { exact: true })).toBeVisible();
      await page
        .getByRole("textbox", { name: "Buscar integrante en la asistencia" })
        .fill("ANA");
      await expect(
        page.getByText(
          "No hay integrantes que coincidan con el estado y la búsqueda seleccionados.",
          { exact: true },
        ),
      ).toBeVisible();
      await page
        .getByRole("textbox", { name: "Buscar integrante en la asistencia" })
        .clear();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `.impeccable/review/erp-enhancements/attendance-view-${width}-${theme}.png`,
        fullPage: true,
        animations: "disabled",
      });
      await page
        .getByRole("button", { name: "Editar asistencia", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "Editar asistencia", exact: true }),
      ).toBeVisible();
      await expect(
        filters.getByRole("button", { name: "Tardanzas 1", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await page.screenshot({
        path: `.impeccable/review/erp-enhancements/attendance-edit-${width}-${theme}.png`,
        fullPage: true,
        animations: "disabled",
      });
    }
  }
  const row = page.locator("tbody tr").filter({ hasText: "BRUNO QA" });
  await row.getByRole("button", { name: "Presente", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Tardanzas 0", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("BRUNO QA", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Todos 4", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Justificados 1", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page).toHaveURL(/\/panel\/asistencias$/, { timeout: 30000 });
  expect(writes).toHaveLength(1);
  expect(writes[0].registro).toEqual(
    rows.map(({ sedipranoId, estado }) => ({ sedipranoId, estado })),
  );
  expect(writes[0].registro).toHaveLength(4);
  expect(rows.map((row) => row.estado)).toEqual([
    "presente",
    "presente",
    "justificado",
    "ausente",
  ]);
  await page.goto(`/panel/asistencias/${id}?mode=view&estado=presente`);
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: "Presentes 2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("ERP enhancements branded QR downloads decode one fluid design and normalize legacy links without uploads", async ({
  page,
}) => {
  test.setTimeout(360000);
  await setup(page, { role: "SEDIPRANO" });
  await page.addInitScript(() => {
    window.__qrRevoked = [];
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = (url) => {
      window.__qrRevoked.push(url);
      revoke(url);
    };
  });
  const link = {
    _id: id,
    codigo: "9xz",
    prefijo: "fm",
    titulo: "Inscripciones QA",
    urlCorta: "https://sediprount.org/fm/9xz",
    urlDestino: "https://forms.gle/example",
    dominioDestino: "forms.gle",
    tipoDestino: "formulario",
    estado: "activo",
    estadoEfectivo: "activo",
    creadorNombre: "Ana QA",
    createdAt: "2026-11-05T15:00Z",
    revision: 0,
    clics: 17,
    qrDiseno: "fluido",
  };
  let unavailable = false,
    requestFailure = false;
  const writes = [];
  page.on("request", (request) => {
    if (
      /\/api\/(enlaces|uploadthing)|uploadthing\.com|utfs\.io/.test(
        request.url(),
      ) &&
      request.method() !== "GET"
    )
      writes.push({
        method: request.method(),
        path: new URL(request.url()).pathname,
      });
  });
  await page.route("**/api/enlaces?**", (route) =>
    route.fulfill({
      json: { data: [link], pagination: { page: 1, pages: 1, total: 1 } },
    }),
  );
  await page.route(`**/api/enlaces/${id}`, (route) =>
    route.fulfill(
      requestFailure
        ? { status: 503, json: { error: "QR temporalmente no disponible" } }
        : {
            json: {
              data: {
                ...link,
                estadoEfectivo: unavailable ? "pausado" : "activo",
              },
            },
          },
    ),
  );
  const reviewDir = ".impeccable/review/qr-single-fluid";
  await mkdir(reviewDir, { recursive: true });
  const images = [];
  let referencePreview;
  for (const design of ["fluido"]) {
    link.qrDiseno = design;
    let png, preview;
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ["light", "dark"]) {
        await page.addInitScript(
          (value) => localStorage.setItem("theme", value),
          theme,
        );
        await page.goto("/panel/enlaces");
        await page
          .getByRole("button", {
            name: "Ver código QR de Inscripciones QA",
            exact: true,
          })
          .click();
        const dialog = page.getByRole("dialog");
        await expect(
          dialog.getByRole("img", {
            name: "Código QR de Inscripciones QA",
            exact: true,
          }),
        ).toBeVisible();
        await expect(
          dialog.getByText(link.urlCorta, { exact: true }),
        ).toBeVisible();
        await dialog.getByRole("img").evaluate((image) => image.decode());
        await page.screenshot({
          path: `${reviewDir}/solid-${design}-${width}-${theme}.png`,
          animations: "disabled",
        });
        if (!png) {
          preview = await dialog.getByRole("img").evaluate(async (element) => {
            const blob = await (await fetch(element.src)).blob();
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result.split(",")[1]);
              reader.readAsDataURL(blob);
            });
          });
          referencePreview = preview;
          const downloadPromise = page.waitForEvent("download", {
            timeout: 15000,
          });
          await dialog
            .getByRole("button", { name: "Descargar PNG", exact: true })
            .click();
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toBe("sedipro-fm-9xz-qr.png");
          png = await readFile(await download.path());
          expect([...png.subarray(0, 8)]).toEqual([
            137, 80, 78, 71, 13, 10, 26, 10,
          ]);
          expect(png.readUInt32BE(16)).toBe(4096);
          expect(png.readUInt32BE(20)).toBe(4096);
          images.push({
            data: png.toString("base64"),
            url: link.urlCorta,
            design,
          });
          const svgDownload = page.waitForEvent("download");
          await dialog
            .getByRole("link", { name: "Descargar SVG", exact: true })
            .click();
          const svg = await svgDownload;
          expect(svg.suggestedFilename()).toBe("sedipro-fm-9xz-qr.svg");
          const vector = await readFile(await svg.path(), "utf8");
          expect(vector).toContain("<svg");
          expect(vector).not.toMatch(/<image|https?:\/\/(?!www.w3.org)/);
          images.push({
            data: Buffer.from(vector).toString("base64"),
            url: link.urlCorta,
            design,
            svg: true,
          });
          const { writeFile } = await import("node:fs/promises");
          await writeFile(`${reviewDir}/${design}.png`, png);
          await writeFile(`${reviewDir}/${design}.svg`, vector);
        }
        const previous = await dialog.getByRole("img").getAttribute("src");
        await dialog
          .getByRole("button", { name: "Regenerar código QR", exact: true })
          .click();
        await expect(dialog.getByRole("img")).toBeVisible();
        await expect
          .poll(() => dialog.getByRole("img").getAttribute("src"))
          .not.toBe(previous);
        await expect
          .poll(() =>
            page.evaluate((url) => window.__qrRevoked.includes(url), previous),
          )
          .toBe(true);
        const regenerated = await dialog.getByRole("img").getAttribute("src");
        const samePng = await page.evaluate(async (url) => {
          const blob = await (await fetch(url)).blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.readAsDataURL(blob);
          });
        }, regenerated);
        expect(samePng).toBe(preview);
        await dialog
          .getByRole("button", { name: "Cerrar", exact: true })
          .last()
          .click();
        await expect(page.getByRole("dialog")).toHaveCount(0);
      }
    }
  }
  // Existing responses with a retired design or no metadata use the same QR.
  for (const legacyDesign of ["origami", undefined]) {
    link.qrDiseno = legacyDesign;
    await page
      .getByRole("button", {
        name: "Ver código QR de Inscripciones QA",
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("img")).toBeVisible();
    const legacyPreview = await dialog
      .getByRole("img")
      .evaluate(async (element) => {
        const blob = await (await fetch(element.src)).blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(blob);
        });
      });
    expect(legacyPreview).toBe(referencePreview);
    await dialog
      .getByRole("button", { name: "Cerrar", exact: true })
      .last()
      .click();
  }
  link.qrDiseno = "fluido";
  // Exercise different matrix masks, platforms and the longer local origin.
  const sampleUrls = ["fb", "ig", "lk", "tk", "wa", "fm", "yt", "go"].map(
    (prefix, index) =>
      `${index > 5 ? "http://localhost:7000" : "https://sediprount.org"}/${prefix}/${["0a9", "x2r", "v6q", "8sn", "m0t", "2rs", "4ds", "z7a"][index]}`,
  );
  sampleUrls.push(
    "http://localhost:7000/fb/c6l",
    "https://sediprount.org/ig/w95",
    "https://sediprount.org/ig/332",
  );
  for (const url of sampleUrls) {
    for (const design of ["fluido"]) {
      link.qrDiseno = design;
      link.urlCorta = url;
      await page
        .getByRole("button", {
          name: "Ver código QR de Inscripciones QA",
          exact: true,
        })
        .click();
      const image = page.getByRole("dialog").getByRole("img");
      await expect(image).toBeVisible();
      const data = await image.evaluate(async (element) => {
        const blob = await (await fetch(element.src)).blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(blob);
        });
      });
      images.push({ data, url: link.urlCorta, design: link.qrDiseno });
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Cerrar", exact: true })
        .last()
        .click();
    }
  }
  unavailable = true;
  await page
    .getByRole("button", {
      name: "Ver código QR de Inscripciones QA",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("dialog").getByText(/Este enlace no está activo/),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cerrar", exact: true })
    .last()
    .click();
  expect(writes).toEqual([]);
  requestFailure = true;
  await page
    .getByRole("button", {
      name: "Ver código QR de Inscripciones QA",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "QR temporalmente no disponible",
  );
  await expect(
    page.getByRole("button", { name: "Descargar PNG", exact: true }),
  ).toHaveCount(0);
  requestFailure = false;
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reintentar", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("img")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cerrar", exact: true })
    .last()
    .click();
  const decoder = await readFile(
    "node_modules/html5-qrcode/html5-qrcode.min.js",
    "utf8",
  );
  await page.route("**/__qa/qr-decoder.js", (route) =>
    route.fulfill({ contentType: "application/javascript", body: decoder }),
  );
  await page.addScriptTag({ url: "/__qa/qr-decoder.js" });
  const decoded = await page.evaluate(async (images) => {
    const host = document.createElement("div");
    host.id = "qa-qr-decoder";
    host.style.width = "400px";
    document.body.append(host);
    const scanner = new window.Html5Qrcode(host.id, {
      formatsToSupport: [window.Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    try {
      const result = [];
      for (const image of images) {
        const bytes = Uint8Array.from(atob(image.data), (value) =>
          value.charCodeAt(0),
        );
        const file = new File([bytes], "qr", {
          type: image.svg ? "image/svg+xml" : "image/png",
        });
        const src = URL.createObjectURL(file);
        const bitmap = await new Promise((resolve, reject) => {
          const element = new Image();
          element.onload = () => resolve(element);
          element.onerror = reject;
          element.src = src;
        });
        for (const size of [1024, 512, 320, 288, 256, 192]) {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = size;
          canvas.getContext("2d").drawImage(bitmap, 0, 0, size, size);
          const scaled = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/png"),
          );
          const value = await scanner
            .scanFile(
              new File([scaled], "qr.png", { type: "image/png" }),
              false,
            )
            .catch((error) => {
              throw new Error(`${image.design} ${image.url} ${size}: ${error}`);
            });
          result.push({ url: image.url, value });
        }
        URL.revokeObjectURL(src);
      }
      return result;
    } finally {
      scanner.clear();
      host.remove();
    }
  }, images);
  expect(decoded).toHaveLength(images.length * 6);
  for (const item of decoded) {
    // Normalizing through URL hides an uppercase scheme/host. Phone scanners
    // must receive the literal lowercase http(s) URL, not just an equivalent URI.
    expect(item.value).toBe(item.url);
    expect(new URL(item.value).pathname).toBe(new URL(item.url).pathname);
  }
  unavailable = false;
  await page.route("**/api/enlaces", async (route) => {
    expect(route.request().method()).toBe("POST");
    const body = route.request().postDataJSON();
    expect(body).not.toHaveProperty("qr");
    expect(body).not.toHaveProperty("image");
    link.titulo = body.titulo;
    return route.fulfill({ json: { data: link } });
  });
  await page.route("**/api/enlaces/detectar", (route) =>
    route.fulfill({
      json: {
        data: {
          prefijo: "fm",
          plataforma: "google_forms",
          tipoDestino: "formulario",
          dominioDestino: "forms.gle",
          urlDestino: link.urlDestino,
        },
      },
    }),
  );
  await page.getByRole("button", { name: "Crear enlace", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Título interno", exact: true })
    .fill("Nuevo enlace con QR QA");
  await page
    .getByRole("textbox", { name: "URL de destino", exact: true })
    .fill(link.urlDestino);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Crear enlace", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByText("Enlace listo para compartir", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ver QR", exact: true }).click();
  await expect(
    page.getByRole("dialog").getByRole("img", {
      name: "Código QR de Nuevo enlace con QR QA",
      exact: true,
    }),
  ).toBeVisible();
});

test("management summary preserves the panel layout with real metrics, filters and role-specific activity cleanup", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mkdir(".impeccable/review/management-summary", { recursive: true });
  for (const role of ["DIRECTIVA", "ADMINISTRADOR", "SUPERADMINISTRADOR"]) {
    await page.unrouteAll({ behavior: "wait" });
    await setup(page, { role });
    let deleted = false;
    const writes = [],
      queries = [];
    await page.route("**/api/dashboard?**", (route) => {
      const params = new URL(route.request().url()).searchParams;
      queries.push(Object.fromEntries(params));
      return route.fulfill({
        json:
          params.get("area") === "TI"
            ? {
                ...managementFixture,
                asistencia: { ...managementFixture.asistencia, porcentaje: 60 },
              }
            : managementFixture,
      });
    });
    await page.route("**/api/dashboard/actividad**", (route) => {
      if (route.request().method() === "DELETE") {
        writes.push(route.request().postDataJSON());
        deleted = true;
        return route.fulfill({ json: { eliminados: 1 } });
      }
      const data = deleted
        ? []
        : [
            {
              _id: id,
              origen: "asistencias",
              modulo: "asistencias",
              accion: "editar",
              titulo: "Reunión de coordinación",
              responsable: "ANA MARÍA QA",
              createdAt: "2026-10-31T20:00:00Z",
              resultado: "completada",
              puedeEliminar: role === "SUPERADMINISTRADOR",
            },
          ];
      return route.fulfill({
        json: { data, pagination: { page: 1, pages: 1, total: data.length } },
      });
    });
    for (const [device, viewport] of [
      ["desktop", { width: 1440, height: 1100 }],
      ["user-1917", { width: 1917, height: 1100 }],
      ["mobile", { width: 390, height: 844 }],
    ]) {
      await page.setViewportSize(viewport);
      for (const theme of ["light", "dark"]) {
        await page.addInitScript(
          (theme) => localStorage.setItem("theme", theme),
          theme,
        );
        await page.goto("/panel");
        await expect(
          page.getByRole("heading", { name: "Comunidad SEDIPRO", exact: true }),
        ).toBeVisible();
        await expect(
          page.getByText("Ana María Qa", { exact: true }),
        ).toBeVisible();
        await expect(
          page.getByRole("heading", { name: "Usuarios", exact: true }),
        ).toHaveCount(0);
        await expect(
          page.getByRole("heading", { name: /SEDInvita/ }),
        ).toHaveCount(0);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const deleteButton = page.getByRole("button", {
          name: /^Eliminar actividad:/,
        });
        await expect(deleteButton).toHaveCount(
          role === "SUPERADMINISTRADOR" ? 1 : 0,
        );
        if (role === "SUPERADMINISTRADOR") {
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({
            path: `.impeccable/review/management-summary/${device}-${theme}.png`,
            fullPage: true,
            animations: "disabled",
          });
          if (device === "mobile") {
            await page
              .locator('[data-slot="table-container"]')
              .evaluate((element) => {
                element.scrollLeft = element.scrollWidth;
              });
            await page.screenshot({
              path: `.impeccable/review/management-summary/mobile-actions-${theme}.png`,
              fullPage: true,
              animations: "disabled",
            });
          }
        }
      }
    }
    await page
      .getByRole("combobox", {
        name: "Área · participación interna",
        exact: true,
      })
      .click();
    await page.getByRole("option", { name: "TI", exact: true }).click();
    await expect.poll(() => queries.at(-1)?.area).toBe("TI");
    await expect(page.getByText("60 %", { exact: true }).first()).toBeVisible();
    if (role === "SUPERADMINISTRADOR") {
      await page.getByRole("button", { name: /^Eliminar actividad:/ }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(writes).toHaveLength(0);
      await page.getByRole("button", { name: "Cancelar", exact: true }).click();
      expect(writes).toHaveLength(0);
      await page.getByRole("button", { name: /^Eliminar actividad:/ }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Eliminar registro", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      expect(writes).toEqual([{ origen: "asistencias", confirmacion: id }]);
      await expect(
        page.getByText("Sin movimientos para mostrar", { exact: true }),
      ).toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});

test("management summary clears activity after a failed filter and retries the selected module", async ({
  page,
}) => {
  await setup(page, { role: "SUPERADMINISTRADOR" });
  let failure = false;
  const queries = [];
  await page.route("**/api/dashboard/actividad**", (route) => {
    const modulo = new URL(route.request().url()).searchParams.get("modulo");
    queries.push(modulo);
    return route.fulfill({
      status: failure ? 503 : 200,
      json: failure
        ? { message: "Actividad temporalmente no disponible" }
        : {
            data: [
              {
                _id: id,
                origen: modulo || "asistencias",
                modulo: modulo || "asistencias",
                accion: "crear",
                titulo:
                  modulo === "enlaces"
                    ? "Enlace institucional QA"
                    : "Asistencia anterior QA",
                responsable: "ANA QA",
                createdAt: "2026-10-31T20:00:00Z",
                resultado: "completada",
                puedeEliminar: true,
              },
            ],
            pagination: { page: 1, pages: 1, total: 1 },
          },
    });
  });
  await page.goto("/panel");
  await expect(
    page.getByText("Asistencia anterior QA", { exact: true }),
  ).toBeVisible();
  failure = true;
  await page.getByRole("combobox", { name: "Módulo", exact: true }).click();
  await page.getByRole("option", { name: "Enlaces", exact: true }).click();
  await expect(
    page.getByText("Actividad temporalmente no disponible", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Asistencia anterior QA", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText(/registros · Página/)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /^Eliminar actividad:/ }),
  ).toHaveCount(0);
  failure = false;
  await page.getByRole("button", { name: "Reintentar", exact: true }).click();
  await expect(
    page.getByText("Enlace institucional QA", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Asistencia anterior QA", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText(/1 registros · Página 1 de 1/)).toBeVisible();
  expect(queries.slice(-2)).toEqual(["enlaces", "enlaces"]);
});

test("management summary recovers errors and closes attendance with confirmation", async ({
  page,
}) => {
  test.setTimeout(120000);
  await setup(page, { role: "DIRECTIVA" });
  let failure = true;
  await page.route("**/api/dashboard?**", (route) =>
    route.fulfill({
      status: failure ? 503 : 200,
      json: failure
        ? { message: "Resumen temporalmente no disponible" }
        : managementFixture,
    }),
  );
  await page.goto("/panel");
  await expect(
    page.getByText("Resumen temporalmente no disponible", { exact: true }),
  ).toBeVisible();
  failure = false;
  await page.getByRole("button", { name: "Reintentar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Métricas de asistencia", exact: true }),
  ).toBeVisible();
  failure = true;
  await page
    .getByRole("combobox", {
      name: "Área · participación interna",
      exact: true,
    })
    .click();
  await page.getByRole("option", { name: "TI", exact: true }).click();
  await expect(
    page.getByText("Resumen temporalmente no disponible", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Métricas de asistencia", exact: true }),
  ).toHaveCount(0);
  failure = false;
  await page.getByRole("button", { name: "Reintentar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Métricas de asistencia", exact: true }),
  ).toBeVisible();
  let closed = false;
  const writes = [];
  await page.route(`**/api/asistencias/${id}`, async (route) => {
    if (route.request().method() === "PUT") {
      writes.push(route.request().postDataJSON());
      closed = true;
    }
    return route.fulfill({
      json: {
        asistencia: {
          _id: id,
          descripcion: "Sesión QA",
          fecha: "2026-10-31T05:00Z",
          estadoRegistro: closed ? "cerrada" : "en_registro",
          registro: [],
          resumen: { presentes: 0, ausentes: 0, tardanzas: 0, justificados: 0 },
        },
      },
    });
  });
  await page.goto(`/panel/asistencias/${id}`);
  await page
    .getByRole("button", { name: "Cerrar asistencia", exact: true })
    .click();
  expect(writes).toHaveLength(0);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Reabrir registro", exact: true }),
  ).toBeVisible();
  expect(writes).toEqual([{ estadoRegistro: "cerrada" }]);
});

test("attendance table closes and reopens with confirmation for every management role", async ({
  page,
}) => {
  test.setTimeout(120000);
  await mkdir(".impeccable/review/attendance-table-lifecycle", {
    recursive: true,
  });
  for (const role of ["DIRECTIVA", "ADMINISTRADOR", "SUPERADMINISTRADOR"]) {
    for (const width of [1440, 390]) {
      await page.unrouteAll({ behavior: "wait" });
      await setup(page, { role });
      await page.setViewportSize({ width, height: 1000 });
      let state = "en_registro";
      const writes = [];
      await page.route("**/api/asistencias**", (route) => {
        if (route.request().method() === "PUT") {
          const body = route.request().postDataJSON();
          writes.push({ path: new URL(route.request().url()).pathname, body });
          state = body.estadoRegistro;
          return route.fulfill({
            json: { asistencia: { _id: id, estadoRegistro: state } },
          });
        }
        return route.fulfill({
          json: {
            asistencias: [
              {
                _id: id,
                descripcion: "Reunión QA de asistencia",
                fecha: "2026-10-31T05:00Z",
                estadoRegistro: state,
                encargados: [],
                resumen: { presentes: 1, ausentes: 2 },
              },
              {
                _id: "1234567890abcdef12345679",
                descripcion: "Asistencia histórica QA",
                fecha: "2026-10-30T05:00Z",
                encargados: [],
                resumen: { presentes: 2, ausentes: 0 },
              },
            ],
          },
        });
      });
      await page.goto("/panel/asistencias");
      const row = page
        .getByRole("row")
        .filter({ hasText: "Reunión QA de asistencia" });
      const historicalRow = page
        .getByRole("row")
        .filter({ hasText: "Asistencia histórica QA" });
      await expect(row.getByText("En registro", { exact: true })).toBeVisible();
      await row
        .getByRole("button", { name: "Cerrar asistencia", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toContainText(
        "Reunión QA de asistencia",
      );
      expect(writes).toEqual([]);
      await page.getByRole("button", { name: "Cancelar", exact: true }).click();
      expect(writes).toEqual([]);
      await row
        .getByRole("button", { name: "Cerrar asistencia", exact: true })
        .click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Confirmar", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(row.getByText("Cerrada", { exact: true })).toBeVisible();
      await expect(
        row.getByRole("button", { name: "Editar", exact: true }),
      ).toBeDisabled();
      await expect(
        historicalRow.getByText("Histórica", { exact: true }),
      ).toBeVisible();
      expect(writes).toEqual([
        { path: `/api/asistencias/${id}`, body: { estadoRegistro: "cerrada" } },
      ]);
      if (role === "SUPERADMINISTRADOR") {
        await page.screenshot({
          path: `.impeccable/review/attendance-table-lifecycle/${width}.png`,
          fullPage: true,
          animations: "disabled",
        });
      }
      await page.reload();
      await expect(row.getByText("Cerrada", { exact: true })).toBeVisible();
      await row
        .getByRole("button", { name: "Reabrir registro", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toContainText(
        "fuera de las métricas",
      );
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Confirmar", exact: true })
        .click();
      await expect(row.getByText("En registro", { exact: true })).toBeVisible();
      await expect(
        row.getByRole("button", { name: "Editar", exact: true }),
      ).toBeEnabled();
      expect(writes.at(-1)).toEqual({
        path: `/api/asistencias/${id}`,
        body: { estadoRegistro: "en_registro" },
      });
      expect(writes).toHaveLength(2);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
});

test("attendance table retains state on errors and prevents duplicate lifecycle writes", async ({
  page,
}) => {
  await setup(page, { role: "DIRECTIVA" });
  let attempts = 0,
    release;
  await page.route("**/api/asistencias**", async (route) => {
    if (route.request().method() !== "PUT")
      return route.fulfill({
        json: {
          asistencias: [
            {
              _id: id,
              descripcion: "Reunión QA de asistencia",
              fecha: "2026-10-31T05:00Z",
              estadoRegistro: "en_registro",
              encargados: [],
              resumen: {},
            },
          ],
        },
      });
    attempts++;
    if (attempts === 1)
      return route.fulfill({
        status: 503,
        json: { message: "No se pudo cerrar. Reintenta." },
      });
    await new Promise((resolve) => {
      release = resolve;
    });
    return route.fulfill({
      json: { asistencia: { _id: id, estadoRegistro: "cerrada" } },
    });
  });
  await page.goto("/panel/asistencias");
  const row = page
    .getByRole("row", { includeHidden: true })
    .filter({ hasText: "Reunión QA de asistencia" });
  await row
    .getByRole("button", { name: "Cerrar asistencia", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(
    page.getByText("No se pudo cerrar. Reintenta.", { exact: true }).first(),
  ).toBeVisible();
  await expect(row.getByText("En registro", { exact: true })).toBeVisible();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect.poll(() => attempts).toBe(2);
  await dialog
    .getByRole("button", { name: "Guardando…", exact: true })
    .dblclick();
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(dialog).toBeVisible();
  expect(attempts).toBe(2);
  release();
  await expect(dialog).toHaveCount(0);
  await expect(row.getByText("Cerrada", { exact: true })).toBeVisible();
  expect(attempts).toBe(2);
});

test("Sediprano summary in desktop/mobile and both themes", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const calls = await setup(page);
  await mkdir(".impeccable/review/member-summary", { recursive: true });
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    await page.setViewportSize(viewport);
    for (const theme of ["light", "dark"]) {
      await page.addInitScript(
        (value) => localStorage.setItem("theme", value),
        theme,
      );
      await page.goto("/panel");
      await expect(
        page.getByRole("heading", {
          name: /^Hola, Ana, miembro del área de PMO$/,
        }),
      ).toBeVisible();
      const greeting = page.getByRole("heading", {
        name: /^Hola, Ana, miembro/,
      });
      const area = greeting.getByText("PMO", { exact: true });
      await expect(area).toHaveClass(/text-\[#887400\]/);
      expect(await area.evaluate((el) => getComputedStyle(el).fontSize)).toBe(
        await greeting.evaluate((el) => getComputedStyle(el).fontSize),
      );
      await expect(
        page.getByText("Tu espacio de trabajo en SEDIPRO UNT.", {
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Participar", exact: true }),
      ).toHaveCount(1);
      await expect(
        page.getByText("Voto registrado", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Participación no habilitada", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Taller de proyectos", { exact: true }),
      ).toBeVisible();
      await expect(
        page
          .getByRole("link", { name: "Tomar asistencia", exact: true })
          .last(),
      ).toHaveAttribute("href", `/panel/asistencias/tomar/${id}`);
      await expect(
        page.getByRole("button", {
          name: "Copiar enlace de Inscripciones del taller",
        }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `.impeccable/review/member-summary/${device}-${theme}.png`,
        fullPage: true,
        animations: "disabled",
      });
    }
  }
  await page.getByRole("button", { name: /Crear enlace Comparte/ }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Crear enlace", exact: true }),
  ).toBeVisible();
  expect(calls).not.toContain("/api/dashboard");
  expect(errors).toEqual([]);
});

test("empty and failed summary states keep tools usable", async ({ page }) => {
  await setup(page, { empty: true });
  await page.goto("/panel");
  await expect(
    page.getByText("No hay próximos eventos publicados."),
  ).toBeVisible();
  await expect(page.getByText("Todavía no has creado enlaces.")).toBeVisible();
  await expect(
    page.getByText("No hay votaciones abiertas en este momento."),
  ).toBeVisible();
  await page.unroute("**/api/**");
  await setup(page, { error: true });
  await page.goto("/panel");
  await expect(
    page.getByRole("alert").getByText(/No se pudo cargar tu resumen/),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Generar certificado/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Participar", exact: true }),
  ).toBeVisible();
  await page.unroute("**/api/**");
  await setup(page);
  await page.getByRole("button", { name: "Reintentar", exact: true }).click();
  await expect(
    page.getByText("Taller de proyectos", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: "No se pudo cargar tu resumen" }),
  ).toHaveCount(0);
});

test("the three management roles keep their existing dashboard", async ({
  page,
}) => {
  for (const role of ["DIRECTIVA", "ADMINISTRADOR", "SUPERADMINISTRADOR"]) {
    await page.unroute("**/api/**");
    const calls = await setup(page, { role });
    await page.goto("/panel");
    await expect(
      page.getByText("Comunidad SEDIPRO", { exact: true }),
    ).toBeVisible();
    expect(calls).toContain("/api/dashboard");
    expect(calls).not.toContain("/api/mi/resumen");
    await expect(
      page.getByText("Enlaces que creaste", { exact: true }),
    ).toHaveCount(0);
  }
});

test("Tomar asistencia is always visible and distinguishes assignments, empty and failed states", async ({
  page,
}) => {
  await setup(page, { empty: true });
  await page.goto("/panel");
  const nav = page.getByRole("link", { name: "Tomar asistencia", exact: true });
  await expect(nav).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Asistencia", exact: true }),
  ).toHaveCount(0);
  await nav.click();
  await expect(page).toHaveURL("/panel/asistencias/tomar", { timeout: 20000 });
  await expect(
    page.getByRole("heading", { name: "Tomar asistencia", exact: true }),
  ).toBeVisible({ timeout: 20000 });
  await expect(
    page.getByText("Actualmente no tienes asistencias a tu cargo."),
  ).toBeVisible();
  await expect(
    page.getByText("No tienes asistencias asignadas", { exact: true }),
  ).toBeVisible();
  await page.unroute("**/api/**");
  await setup(page);
  await page.goto("/panel/asistencias/tomar");
  await expect(page.getByText(/Estás encargado de 1 asistencia/)).toBeVisible();
  await expect(
    page.getByText("Reunión del área PMO", { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(`a[href="/panel/asistencias/tomar/${id}"]`),
  ).toBeVisible();
  await page.unroute("**/api/**");
  await setup(page, { assignmentsError: true });
  await page.goto("/panel/asistencias/tomar");
  await expect(
    page.getByRole("alert").getByText(/No se pudieron cargar tus asignaciones/),
  ).toBeVisible();
  await expect(
    page.getByText("No tienes asistencias asignadas", { exact: true }),
  ).toHaveCount(0);
  await page.unroute("**/api/**");
  await setup(page);
  await page.getByRole("button", { name: "Reintentar", exact: true }).click();
  await expect(
    page.getByText("Reunión del área PMO", { exact: true }),
  ).toBeVisible();
  await page.unroute("**/api/**");
  await setup(page, { role: "DIRECTIVA", empty: true });
  await page.goto("/panel/asistencias/tomar");
  await expect(
    page.getByRole("link", { name: "Asistencia", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Tomar asistencia", exact: true }),
  ).toBeVisible();
});

async function paintColors(locator) {
  return locator.evaluate((el) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const rgba = (color) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data];
    };
    let background = [255, 255, 255, 255];
    for (let node = el; node; node = node.parentElement) {
      const candidate = rgba(getComputedStyle(node).backgroundColor);
      if (candidate[3] === 255) {
        background = candidate;
        break;
      }
    }
    return {
      color: rgba(getComputedStyle(el).color).slice(0, 3),
      background: background.slice(0, 3),
    };
  });
}
function colorContrast(a, b) {
  const luminance = (values) =>
    values
      .map((value) => value / 255)
      .map((value) =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
      )
      .reduce(
        (total, value, i) => total + value * [0.2126, 0.7152, 0.0722][i],
        0,
      );
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
test("all five area colors retain their hue, readability and shared palette in both themes", async ({
  page,
}) => {
  test.setTimeout(180000);
  const areas = ["TI", "PMO", "LTK Y FNZ", "GTH", "MKT"];
  await mkdir(".impeccable/review/member-summary", { recursive: true });
  for (const theme of ["light", "dark"]) {
    await page.addInitScript(
      (value) => localStorage.setItem("theme", value),
      theme,
    );
    await page.unroute("**/api/**");
    await setup(page, { role: "ADMINISTRADOR", empty: true });
    await page.goto("/panel/sedipranos");
    const section = page.locator(
      'section[aria-label="Cantidad de sedipranos por área"]',
    );
    await expect(section).toBeVisible();
    const palette = {};
    for (const area of areas) {
      const label = section.getByText(area, { exact: true });
      const paint = await paintColors(label);
      expect(
        colorContrast(paint.color, paint.background),
      ).toBeGreaterThanOrEqual(4.5);
      const [r, g, b] = paint.color;
      if (area === "PMO") {
        expect(g).toBeGreaterThan(r * 0.75);
        expect(b).toBeLessThan(g * 0.4);
      }
      if (area === "TI") {
        expect(r).toBeGreaterThan(g);
        expect(g).toBeGreaterThan(b);
      }
      if (area === "MKT") {
        expect(r).toBeGreaterThan(g);
        expect(r).toBeGreaterThan(b);
      }
      if (area === "GTH") {
        expect(g).toBeGreaterThan(r);
        expect(g).toBeGreaterThan(b);
      }
      if (area === "LTK Y FNZ") {
        expect(b).toBeGreaterThan(r);
        expect(g).toBeGreaterThan(r);
      }
      palette[area] = paint.color;
    }
    await section.screenshot({
      path: `.impeccable/review/member-summary/area-colors-${theme}.png`,
    });
    for (const area of areas) {
      await page.unroute("**/api/**");
      await setup(page, { area, empty: true });
      await page.goto("/panel");
      const heading = page.getByRole("heading", {
        name: new RegExp(`miembro del área de ${area}$`),
      });
      await expect(heading).toBeVisible();
      const paint = await paintColors(heading.getByText(area, { exact: true }));
      expect(paint.color).toEqual(palette[area]);
      expect(
        colorContrast(paint.color, paint.background),
      ).toBeGreaterThanOrEqual(4.5);
      if (area === "PMO")
        await heading.screenshot({
          path: `.impeccable/review/member-summary/area-greeting-${theme}.png`,
        });
    }
  }
});

test("attendance creation selects areas and optional leadership while legacy rows remain general", async ({
  page,
}) => {
  test.setTimeout(120000);
  await setup(page, { role: "DIRECTIVA", empty: true });
  let created = null;
  const historical = {
    _id: id,
    fecha: "2026-10-01T05:00:00.000Z",
    descripcion: "Histórica general",
    resumen: { presentes: 2, ausentes: 0, tardanzas: 0, justificados: 0 },
    encargados: [],
  };
  await page.route("**/api/asistencias", async (route) => {
    if (route.request().method() === "POST") {
      created = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        json: { asistencia: { ...historical, ...created } },
      });
    }
    return route.fulfill({
      json: {
        asistencias: [
          historical,
          ...(created
            ? [{ ...historical, _id: "abcdef123456789012345678", ...created }]
            : []),
        ],
      },
    });
  });
  await mkdir(".impeccable/review/attendance-scope", { recursive: true });
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/panel/asistencias");
    await expect(page.getByText("Todo SEDIPRO", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Crear asistencia", exact: true })
      .click();
    await expect(
      page.getByLabel("Incluir asistencia de Presidencia", { exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("combobox", { name: "Alcance de la asistencia" })
      .click();
    await page.getByRole("option", { name: "Por áreas", exact: true }).click();
    await page
      .getByPlaceholder("Ej: Reunión ordinaria semanal")
      .fill(`Reunión GTH ${device}`);
    await page
      .getByRole("button", { name: "Guardar asistencia", exact: true })
      .click();
    await expect(page.getByText("Selecciona al menos un área.")).toBeVisible();
    await page.getByLabel("GTH", { exact: true }).check();
    await page.getByLabel("TI", { exact: true }).check();
    await page
      .getByLabel("Incluir asistencia de Vicepresidencia", { exact: true })
      .check();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `.impeccable/review/attendance-scope/${device}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: "Guardar asistencia", exact: true })
      .click();
    await expect(
      page.getByText(`Reunión GTH ${device}`, { exact: false }).first(),
    ).toBeVisible();
    expect(created.alcance).toEqual({
      tipo: "areas",
      areas: ["GTH", "TI"],
      incluirPresidencia: false,
      incluirVicepresidencia: true,
    });
    await expect(
      page.getByText(/2 áreas: GTH, TI · Incluye Vicepresidencia/),
    ).toBeVisible();
    created = null;
  }
});

test("attendance check-in previews identity before any write and bounds the header title", async ({
  page,
}) => {
  test.setTimeout(120000);
  const description =
    "Reunión de coordinación y planificación institucional con un nombre muy largo para comprobar el encabezado";
  await setup(page, { assignmentDescription: description });
  const person = {
    nombres: "JOSÉ JULIO",
    apellidos: "NÚÑEZ RAMOS",
    dni: "12345678",
    area: "TI",
    fotoPerfil: { url: "/img/directiva/jose.webp" },
  };
  let writes = [];
  let marked = false;
  const attendance = () => ({
    _id: id,
    descripcion: description,
    fecha: "2026-10-31T05:00:00.000Z",
    resumen: { presentes: marked ? 1 : 0, ausentes: marked ? 0 : 1 },
    registro: [
      {
        sedipranoId: id,
        estado: marked ? "presente" : "ausente",
        sediprano: person,
      },
    ],
  });
  await page.route(`**/api/asistencias/${id}`, (route) =>
    route.fulfill({ json: { asistencia: attendance() } }),
  );
  await page.route(`**/api/registro/${id}`, async (route) => {
    writes.push(route.request().postDataJSON());
    marked = true;
    await route.fulfill({ json: { message: "Registrado", sediprano: person } });
  });
  await mkdir(".impeccable/review/attendance-preview", { recursive: true });
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    marked = false;
    writes = [];
    await page.setViewportSize(viewport);
    await page.goto(`/panel/asistencias/tomar/${id}`);
    await expect(
      page.getByRole("heading", { name: description, exact: true }),
    ).toBeVisible();
    const headerName = page.locator("header").getByTitle(description);
    await expect(headerName).toBeVisible();
    expect((await headerName.textContent()).trim().length).toBeLessThanOrEqual(
      56,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByLabel("DNI", { exact: true }).fill("12345678");
    await page.getByRole("button", { name: "Registrar", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByText("José Julio Núñez Ramos", { exact: true }),
    ).toBeVisible();
    await expect(dialog.getByText("TI", { exact: true })).toBeVisible();
    const photo = dialog.getByRole("img", {
      name: "Foto de José Julio Núñez Ramos",
    });
    await expect(photo).toBeVisible();
    expect((await photo.boundingBox()).width).toBeGreaterThanOrEqual(150);
    expect(writes).toHaveLength(0);
    await page.screenshot({
      path: `.impeccable/review/attendance-preview/${device}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await dialog.getByRole("button", { name: "Atrás", exact: true }).click();
    expect(writes).toHaveLength(0);
    await page.getByRole("button", { name: "Registrar", exact: true }).click();
    await dialog
      .getByRole("button", { name: "Confirmar registro", exact: true })
      .click();
    await expect(dialog).toHaveCount(0);
    expect(writes).toEqual([{ dni: "12345678", estado: "presente" }]);
    await expect(page.getByLabel("DNI", { exact: true })).toHaveValue("");
    await page.getByLabel("DNI", { exact: true }).fill("87654321");
    await page.getByRole("button", { name: "Registrar", exact: true }).click();
    await expect(
      page.getByText(
        "Este DNI no pertenece a los convocados de esta asistencia.",
        { exact: true },
      ),
    ).toBeVisible();
    expect(writes).toHaveLength(1);
  }
});

test("attendance audit is exclusive to superadmin on management pages", async ({
  page,
}) => {
  for (const role of ["DIRECTIVA", "ADMINISTRADOR", "SUPERADMINISTRADOR"]) {
    await page.unrouteAll({ behavior: "wait" });
    const calls = await setup(page, { role });
    await page.route("**/api/asistencias", (route) =>
      route.fulfill({ json: { asistencias: [] } }),
    );
    await page.goto("/panel/asistencias");
    await expect(
      page.getByRole("heading", { name: "Asistencias", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Auditoría", exact: true }),
    ).toHaveCount(role === "SUPERADMINISTRADOR" ? 1 : 0);
    if (role !== "SUPERADMINISTRADOR") {
      await page.goto("/panel/asistencias/auditoria");
      await expect(
        page.getByText("Tu cuenta no tiene acceso a esta sección.", {
          exact: true,
        }),
      ).toBeVisible();
      expect(
        calls.some((path) => path.startsWith("/api/asistencias/auditoria")),
      ).toBe(false);
    }
    await page.goto(`/panel/asistencias/tomar`);
    await expect(
      page.getByRole("button", { name: "Auditoría", exact: true }),
    ).toHaveCount(0);
  }
});

test("attendance audit filters and deletes one row with confirmation desktop/mobile", async ({
  page,
}) => {
  test.setTimeout(120000);
  await setup(page, { role: "SUPERADMINISTRADOR" });
  const fixture = [
    {
      _id: id,
      asistenciaId: id,
      asistenciaTitulo: "Reunión de coordinación de TI y GTH",
      actor: { nombre: "ANA MARÍA RAMOS", rol: "DIRECTIVA" },
      accion: "editar",
      resultado: "completada",
      puedeEliminar: true,
      createdAt: "2026-10-31T20:00:00.000Z",
      cambios: [
        {
          campo: "Descripción",
          antes: "Reunión de TI",
          despues: "Reunión de coordinación de TI y GTH",
        },
        {
          campo: "Estado de José Pérez",
          antes: "ausente",
          despues: "justificado",
        },
      ],
    },
    {
      _id: "abcdefabcdefabcdefabcdef",
      asistenciaId: id,
      asistenciaTitulo: "Reunión general",
      actor: { nombre: "ELIASER RAMOS", rol: "ADMINISTRADOR" },
      accion: "asignar_encargado",
      resultado: "por_verificar",
      puedeEliminar: false,
      createdAt: "2026-10-31T19:00:00.000Z",
      cambios: [],
    },
  ];
  let rows = [...fixture];
  const deletions = [];
  const queries = [];
  await page.route("**/api/asistencias/auditoria**", async (route) => {
    const request = route.request();
    if (request.method() === "DELETE") {
      deletions.push(request.postDataJSON());
      rows = rows.filter((row) => !request.url().endsWith(row._id));
      return route.fulfill({ json: { eliminados: 1 } });
    }
    const params = new URL(request.url()).searchParams;
    queries.push(Object.fromEntries(params));
    const data = rows.filter(
      (row) =>
        (!params.get("q") || row.asistenciaTitulo.includes(params.get("q"))) &&
        (!params.get("accion") || row.accion === params.get("accion")),
    );
    return route.fulfill({
      json: { data, pagination: { page: 1, pages: 1, total: data.length } },
    });
  });
  await mkdir(".impeccable/review/attendance-audit", { recursive: true });
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    await page.setViewportSize(viewport);
    for (const theme of ["light", "dark"]) {
      rows = [...fixture];
      await page.addInitScript(
        (theme) => localStorage.setItem("theme", theme),
        theme,
      );
      await page.goto("/panel/asistencias/auditoria");
      await expect(
        page.getByText("Ana María Ramos", { exact: true }),
      ).toBeVisible();
      const deletes = page.getByRole("button", { name: /^Eliminar registro:/ });
      await expect(deletes).toHaveCount(2);
      await expect(deletes.nth(1)).toBeDisabled();
      await page.getByText("Ver cambios (2)", { exact: true }).click();
      await expect(
        page.getByText("Estado de José Pérez", { exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page
        .locator('[data-slot="table-container"]')
        .evaluate((element) => {
          element.scrollLeft = 0;
        });
      await page.screenshot({
        path: `.impeccable/review/attendance-audit/${device}-${theme}.png`,
        fullPage: true,
        animations: "disabled",
      });
      if (device === "mobile") {
        await page
          .locator('[data-slot="table-container"]')
          .evaluate((element) => {
            element.scrollLeft = element.scrollWidth;
          });
        await page.screenshot({
          path: `.impeccable/review/attendance-audit/mobile-actions-${theme}.png`,
          fullPage: true,
          animations: "disabled",
        });
      }
    }
    await page.getByLabel("Buscar en auditoría").fill("coordinación");
    await page.getByRole("button", { name: "Buscar", exact: true }).click();
    await expect(
      page.getByRole("button", { name: /^Eliminar registro:/ }),
    ).toHaveCount(1);
    expect(queries.at(-1).q).toBe("coordinación");
    const before = deletions.length;
    await page.getByRole("button", { name: /^Eliminar registro:/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(deletions).toHaveLength(before);
    await page.getByRole("button", { name: "Cancelar", exact: true }).click();
    expect(deletions).toHaveLength(before);
    await page.getByRole("button", { name: /^Eliminar registro:/ }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Eliminar registro", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(deletions.at(-1)).toEqual({ confirmacion: id });
    expect(deletions).toHaveLength(before + 1);
    await expect(
      page.getByText("No hay acciones para mostrar", { exact: true }),
    ).toBeVisible();
  }
});

async function mockCertificateActivity(page) {
  const events = [];
  const control = {
    failStart: false,
    failFinish: false,
    holdBatch: false,
    release: null,
  };
  await page.route("**/api/certificados/actividad**", async (route) => {
    const body = route.request().postDataJSON();
    events.push({ method: route.request().method(), body });
    if (route.request().method() === "PATCH")
      return route.fulfill({
        status: control.failFinish ? 503 : 200,
        json: {
          resultado: body.resultado,
          message: "No se pudo registrar la actividad de certificados.",
        },
      });
    if (control.failStart)
      return route.fulfill({
        status: 503,
        json: { message: "No se pudo registrar la actividad de certificados." },
      });
    if (control.holdBatch && body.accion === "descargar_lote")
      await new Promise((resolve) => {
        control.release = resolve;
      });
    return route.fulfill({
      json: {
        id: String(events.length).padStart(24, "0"),
        resultado: body.accion.startsWith("descargar_")
          ? "iniciada"
          : "registrada",
      },
    });
  });
  return { events, control };
}

test("certificate audit entry and route are exclusive to superadmin while every role can generate", async ({
  page,
}) => {
  for (const role of [
    "SEDIPRANO",
    "DIRECTIVA",
    "ADMINISTRADOR",
    "SUPERADMINISTRADOR",
  ]) {
    await page.unrouteAll({ behavior: "wait" });
    const calls = await setup(page, { role });
    const { events } = await mockCertificateActivity(page);
    await page.goto("/panel/certificados");
    await expect(
      page.getByRole("heading", {
        name: "Generador de certificados",
        exact: true,
      }),
    ).toBeVisible();
    await expect
      .poll(
        () =>
          events.filter((item) => item.body.accion === "abrir_modulo").length,
      )
      .toBe(1);
    await expect(
      page.locator('a[href="/panel/certificados/auditoria"]'),
    ).toHaveCount(role === "SUPERADMINISTRADOR" ? 1 : 0);
    if (role !== "SUPERADMINISTRADOR") {
      await page.goto("/panel/certificados/auditoria");
      await expect(
        page.getByText("Tu cuenta no tiene acceso a esta sección.", {
          exact: true,
        }),
      ).toBeVisible();
      expect(
        calls.some((path) => path.startsWith("/api/certificados/auditoria")),
      ).toBe(false);
    }
  }
});

test("certificate audit tracks real exports, cancellation and failures without storing recipients or files", async ({
  page,
}) => {
  test.setTimeout(120000);
  await setup(page);
  const { events, control } = await mockCertificateActivity(page);
  const downloads = [];
  page.on("download", (item) => downloads.push(item));
  await page.goto("/panel/certificados");
  await page.getByRole("button", { name: /Participantes externos/ }).click();
  await page
    .getByLabel("Nombre del proyecto", { exact: true })
    .fill("Proyecto QA de certificados");
  await page.getByRole("combobox", { name: "Origen de participantes" }).click();
  await page
    .getByRole("option", { name: "Ingreso manual", exact: true })
    .click();
  await page
    .getByLabel("Nombre completo", { exact: true })
    .fill("Persona Solo Navegador");
  await page.getByRole("button", { name: "Añadir", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Continuar a plantilla y firmas",
      exact: true,
    })
    .click();
  await page
    .getByLabel("Imagen de la plantilla", { exact: true })
    .setInputFiles(
      fileURLToPath(
        new URL(
          "../../public/certificados/plantilla-base.png",
          import.meta.url,
        ),
      ),
    );
  await expect(page.getByText(/listo para editar/)).toBeVisible();
  await page.getByRole("button", { name: "Abrir editor", exact: true }).click();
  await page.getByRole("tab", { name: "Descarga", exact: true }).click();
  const pdf = page.waitForEvent("download");
  await page.getByRole("button", { name: "PDF actual", exact: true }).click();
  expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
  await expect
    .poll(
      () =>
        events.filter((item) => item.method === "PATCH").at(-1)?.body.resultado,
    )
    .toBe("descarga_iniciada");
  await expect(
    page.getByRole("button", { name: "PDF actual", exact: true }),
  ).toBeEnabled();
  const zip = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Descargar ZIP (1)", exact: true })
    .click();
  expect((await zip).suggestedFilename()).toMatch(/\.zip$/);
  await expect(
    page.getByRole("button", { name: "Descargar ZIP (1)", exact: true }),
  ).toBeEnabled();
  expect(
    events.find((item) => item.body.accion === "descargar_lote").body,
  ).toMatchObject({
    tipo: "externos",
    cantidad: 1,
    formato: "pdf",
    fuente: "manual",
    proyecto: "Proyecto QA de certificados",
  });

  control.holdBatch = true;
  await page
    .getByRole("button", { name: "Descargar ZIP (1)", exact: true })
    .click();
  await expect.poll(() => Boolean(control.release)).toBe(true);
  await page
    .getByRole("button", { name: "Cancelar generación", exact: true })
    .click();
  control.release();
  await expect
    .poll(
      () =>
        events.filter((item) => item.method === "PATCH").at(-1)?.body.resultado,
    )
    .toBe("cancelada");
  await expect(
    page.getByRole("button", { name: "Descargar ZIP (1)", exact: true }),
  ).toBeEnabled();
  expect(downloads).toHaveLength(2);
  control.holdBatch = false;

  await page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback) {
      HTMLCanvasElement.prototype.toBlob = original;
      callback(null);
    };
  });
  await page.getByRole("button", { name: "PNG actual", exact: true }).click();
  await expect
    .poll(
      () =>
        events.filter((item) => item.method === "PATCH").at(-1)?.body.resultado,
    )
    .toBe("fallida");
  await expect(
    page.getByText("No se pudo exportar la imagen.", { exact: true }),
  ).toBeVisible();
  expect(downloads).toHaveLength(2);

  control.failStart = true;
  await page.getByRole("button", { name: "PNG actual", exact: true }).click();
  await expect(
    page.getByText("No se pudo registrar la actividad de certificados.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(downloads).toHaveLength(2);
  control.failStart = false;
  control.failFinish = true;
  const png = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG actual", exact: true }).click();
  expect((await png).suggestedFilename()).toMatch(/\.png$/);
  await expect(
    page.getByText(/No se pudo registrar una actividad de certificados/),
  ).toBeVisible();
  await expect(
    page.getByText("Se inició la descarga de Persona Solo Navegador.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(downloads).toHaveLength(3);
  const serialized = JSON.stringify(events);
  expect(serialized).not.toContain("Persona Solo Navegador");
  expect(serialized).not.toContain("base64");
  expect(serialized).not.toContain("plantilla-base.png");
  for (const action of [
    "abrir_modulo",
    "seleccionar_tipo",
    "preparar_participantes",
    "cargar_plantilla",
    "abrir_editor",
  ])
    expect(events.some((item) => item.body.accion === action)).toBe(true);
});

test("certificate audit history supports mobile themes, search and confirmed row and full cleanup", async ({
  page,
}) => {
  test.setTimeout(120000);
  await setup(page, { role: "SUPERADMINISTRADOR" });
  await mockCertificateActivity(page);
  const fixture = [
    {
      _id: id,
      actor: { nombre: "ANA MARÍA RAMOS", rol: "SEDIPRANO" },
      accion: "descargar_lote",
      tipo: "externos",
      proyecto: "Taller de proyectos",
      cantidad: 24,
      generados: 24,
      formato: "pdf",
      fuente: "event",
      resultado: "descarga_iniciada",
      createdAt: "2026-10-31T20:00:00.000Z",
      puedeEliminar: true,
    },
    {
      _id: "abcdefabcdefabcdefabcdef",
      actor: { nombre: "ELIASER RAMOS", rol: "DIRECTIVA" },
      accion: "abrir_modulo",
      cantidad: 0,
      resultado: "registrada",
      createdAt: "2026-10-31T19:00:00.000Z",
      puedeEliminar: true,
    },
  ];
  let rows = [...fixture];
  const deletes = [];
  let cleanupFailure = false;
  const cutoff = "2026-11-05T22:00:00.000Z";
  await page.route("**/api/certificados/auditoria**", async (route) => {
    if (route.request().method() === "DELETE") {
      deletes.push(route.request().postDataJSON());
      const body = route.request().postDataJSON();
      if (body.modo === "limpiar") {
        expect(new URL(route.request().url()).pathname).toBe(
          "/api/certificados/auditoria",
        );
        expect(body).toEqual({
          modo: "limpiar",
          hasta: cutoff,
          confirmacion: "LIMPIAR AUDITORIA",
        });
        if (cleanupFailure)
          return route.fulfill({
            status: 503,
            json: { message: "No se pudo limpiar la auditoría" },
          });
        const count = rows.length;
        rows = [];
        return route.fulfill({ json: { eliminados: count } });
      }
      rows = rows.filter((row) => !route.request().url().endsWith(row._id));
      return route.fulfill({ json: { eliminados: 1 } });
    }
    const q = new URL(route.request().url()).searchParams.get("q");
    const data = rows.filter((row) => !q || row.proyecto?.includes(q));
    return route.fulfill({
      json: {
        data,
        pagination: { page: 1, pages: 1, total: data.length },
        limpiarHasta: cutoff,
        totalRegistros: rows.length,
      },
    });
  });
  await mkdir(".impeccable/review/certificate-audit", { recursive: true });
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    await page.setViewportSize(viewport);
    for (const theme of ["light", "dark"]) {
      rows = [...fixture];
      await page.addInitScript(
        (theme) => localStorage.setItem("theme", theme),
        theme,
      );
      await page.goto("/panel/certificados");
      await expect(
        page.getByRole("heading", {
          name: "Generador de certificados",
          exact: true,
        }),
      ).toBeVisible();
      await page.screenshot({
        path: `.impeccable/review/certificate-audit/${device}-generator-${theme}.png`,
        fullPage: true,
        animations: "disabled",
      });
      await page.locator('a[href="/panel/certificados/auditoria"]').click();
      await expect(
        page.getByText("Ana María Ramos", { exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `.impeccable/review/certificate-audit/${device}-${theme}.png`,
        fullPage: true,
        animations: "disabled",
      });
      if (device === "mobile") {
        await page
          .locator('[data-slot="table-container"]')
          .evaluate((element) => {
            element.scrollLeft = element.scrollWidth;
          });
        await page.screenshot({
          path: `.impeccable/review/certificate-audit/mobile-actions-${theme}.png`,
          fullPage: true,
          animations: "disabled",
        });
      }
    }
    await page.getByLabel("Buscar en auditoría").fill("Taller");
    await page.getByRole("button", { name: "Buscar", exact: true }).click();
    await expect(
      page.getByRole("button", { name: /^Eliminar registro:/ }),
    ).toHaveCount(1);
    const before = deletes.length;
    await page.getByRole("button", { name: /^Eliminar registro:/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(deletes).toHaveLength(before);
    await page.getByRole("button", { name: "Cancelar", exact: true }).click();
    expect(deletes).toHaveLength(before);
    await page.getByRole("button", { name: /^Eliminar registro:/ }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Eliminar registro", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(deletes.at(-1)).toEqual({ confirmacion: id });
    await expect(
      page.getByText("No hay actividades para mostrar", { exact: true }),
    ).toBeVisible();
    const clear = page.getByRole("button", {
      name: "Limpiar toda la auditoría",
      exact: true,
    });
    await expect(clear).toBeEnabled();
    const beforeClear = deletes.length;
    await clear.click();
    const confirmation = page.getByRole("dialog");
    await expect(
      confirmation.getByText(/aunque hayas aplicado filtros/),
    ).toBeVisible();
    await page.screenshot({
      path: `.impeccable/review/certificate-audit/${device}-clear-confirm.png`,
      animations: "disabled",
    });
    await confirmation
      .getByRole("button", { name: "Cancelar", exact: true })
      .click();
    expect(deletes).toHaveLength(beforeClear);
    cleanupFailure = true;
    await clear.click();
    await confirmation
      .getByRole("button", { name: "Eliminar definitivamente", exact: true })
      .click();
    await expect(
      page.getByText("No se pudo limpiar la auditoría", { exact: true }),
    ).toBeVisible();
    await expect(confirmation).toBeVisible();
    expect(rows).toHaveLength(1);
    cleanupFailure = false;
    await confirmation
      .getByRole("button", { name: "Eliminar definitivamente", exact: true })
      .click();
    await expect(confirmation).toHaveCount(0);
    await expect(clear).toBeDisabled();
    expect(rows).toHaveLength(0);
  }
});

test("QR download styles preserve the same matrix, exact URL, opaque backgrounds and current export", async ({
  page,
}) => {
  test.setTimeout(240000);
  await setup(page, { role: "SEDIPRANO" });
  const { writeFile } = await import("node:fs/promises");
  const reviewDir = ".impeccable/review/qr-download-styles";
  await mkdir(reviewDir, { recursive: true });
  const link = {
    _id: id,
    prefijo: "ig",
    codigo: "332",
    titulo: "QR institucional QA",
    urlCorta: "https://sediprount.org/ig/332",
    estadoEfectivo: "activo",
    estado: "activo",
    createdAt: "2026-11-06T10:00:00.000Z",
    creadorNombre: "Persona QA",
    revision: 0,
  };
  const options = [
    ["institutional", "Institucional", ""],
    ["black-white", "Negro sobre blanco", "-negro-blanco"],
    ["white-black", "Blanco sobre negro", "-blanco-negro"],
  ];
  await page.addInitScript(() => {
    window.__qrCreated = [];
    window.__qrRevoked = [];
    const create = URL.createObjectURL.bind(URL),
      revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      window.__qrCreated.push(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      window.__qrRevoked.push(url);
      revoke(url);
    };
    const toBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      if (this.width === 4096 && window.__holdQrExport) {
        return toBlob.call(
          this,
          (blob) =>
            setTimeout(() => {
              callback(blob);
              window.__exportCallbackDelivered = true;
            }, 200),
          ...args,
        );
      }
      return toBlob.call(this, callback, ...args);
    };
  });
  let detailReads = 0;
  const writes = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/enlaces") && request.method() !== "GET")
      writes.push(request.method());
  });
  await page.route("**/api/enlaces?**", (route) =>
    route.fulfill({
      json: { data: [link], pagination: { page: 1, pages: 1, total: 1 } },
    }),
  );
  await page.route(`**/api/enlaces/${id}`, (route) => {
    detailReads++;
    return route.fulfill({ json: { data: link } });
  });
  const samples = [],
    matrices = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const theme of ["light", "dark"]) {
      await page.addInitScript(
        (value) => localStorage.setItem("theme", value),
        theme,
      );
      await page.goto("/panel/enlaces");
      await page
        .getByRole("button", {
          name: `Ver código QR de ${link.titulo}`,
          exact: true,
        })
        .click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByRole("img")).toBeVisible();
      await expect(
        dialog.getByRole("radio", { name: "Institucional", exact: true }),
      ).toBeChecked();
      await expect(dialog.getByRole("radio")).toHaveCount(3);
      await expect(
        dialog.getByRole("radio", { name: "Transparente", exact: true }),
      ).toHaveCount(0);
      const readCount = detailReads;
      for (const [style, label, suffix] of options) {
        const previous = await dialog.getByRole("img").getAttribute("src");
        await dialog.getByRole("radio", { name: label, exact: true }).click();
        await expect(
          dialog.getByRole("radio", { name: label, exact: true }),
        ).toBeChecked();
        await expect(dialog.getByRole("img")).toBeVisible();
        await dialog.getByRole("img").evaluate((image) => image.decode());
        if (style !== "institutional")
          await expect
            .poll(() =>
              page.evaluate(
                (url) => window.__qrRevoked.includes(url),
                previous,
              ),
            )
            .toBe(true);
        expect(detailReads).toBe(readCount);
        if (style === "white-black")
          await expect(
            dialog.getByText(
              /Algunos lectores no reconocen códigos invertidos/,
            ),
          ).toBeVisible();
        await dialog.evaluate((element) => {
          element.scrollTop = 0;
        });
        await page.screenshot({
          path: `${reviewDir}/${style}-${width}-${theme}.png`,
          animations: "disabled",
        });
        if (width === 1440 && theme === "light") {
          const pngPromise = page.waitForEvent("download");
          await dialog
            .getByRole("button", { name: "Descargar PNG", exact: true })
            .click();
          const png = await pngPromise;
          expect(png.suggestedFilename()).toBe(
            `sedipro-ig-332-qr${suffix}.png`,
          );
          const pngBytes = await readFile(await png.path());
          expect(pngBytes.readUInt32BE(16)).toBe(4096);
          expect(pngBytes.readUInt32BE(20)).toBe(4096);
          await writeFile(`${reviewDir}/${style}.png`, pngBytes);
          samples.push({
            style,
            type: "image/png",
            data: pngBytes.toString("base64"),
          });
          const svgPromise = page.waitForEvent("download");
          await dialog
            .getByRole("link", { name: "Descargar SVG", exact: true })
            .click();
          const svgDownload = await svgPromise;
          expect(svgDownload.suggestedFilename()).toBe(
            `sedipro-ig-332-qr${suffix}.svg`,
          );
          const svg = await readFile(await svgDownload.path(), "utf8");
          expect(svg).not.toMatch(
            /<image|conic-gradient|https?:\/\/(?!www.w3.org)/,
          );
          await writeFile(`${reviewDir}/${style}.svg`, svg);
          samples.push({
            style,
            type: "image/svg+xml",
            data: Buffer.from(svg).toString("base64"),
          });
          matrices.push(
            await page.evaluate(
              (text) =>
                [
                  ...new DOMParser()
                    .parseFromString(text, "image/svg+xml")
                    .querySelectorAll("path"),
                ].map((path) => path.getAttribute("d")),
              svg,
            ),
          );
        }
      }
      await dialog
        .getByRole("button", { name: "Descargar PNG", exact: true })
        .scrollIntoViewIfNeeded();
      if (width === 390)
        await page.screenshot({
          path: `${reviewDir}/mobile-downloads-${theme}.png`,
          animations: "disabled",
        });
      // Keyboard selection and a pending PNG export must not download a stale style.
      if (width === 1440 && theme === "dark") {
        await dialog
          .getByRole("radio", { name: "Institucional", exact: true })
          .focus();
        await page.keyboard.press("ArrowRight");
        await expect(
          dialog.getByRole("radio", {
            name: "Negro sobre blanco",
            exact: true,
          }),
        ).toBeChecked();
        await expect(dialog.getByRole("img")).toBeVisible();
        const downloads = [];
        page.on("download", (download) =>
          downloads.push(download.suggestedFilename()),
        );
        await page.evaluate(() => {
          window.__holdQrExport = true;
          window.__exportCallbackDelivered = false;
        });
        await dialog
          .getByRole("button", { name: "Descargar PNG", exact: true })
          .click();
        await expect(
          dialog.getByRole("button", { name: "Preparando PNG…", exact: true }),
        ).toBeVisible();
        await dialog
          .getByRole("radio", { name: "Institucional", exact: true })
          .click();
        await expect(dialog.getByRole("img")).toBeVisible();
        await expect
          .poll(() => page.evaluate(() => window.__exportCallbackDelivered))
          .toBe(true);
        expect(downloads).toEqual([]);
        await page.evaluate(() => {
          window.__holdQrExport = false;
        });
      }
      await dialog
        .getByRole("button", { name: "Cerrar", exact: true })
        .last()
        .click();
      await expect(dialog).toHaveCount(0);
      await expect
        .poll(() =>
          page.evaluate(() =>
            window.__qrCreated.every((url) => window.__qrRevoked.includes(url)),
          ),
        )
        .toBe(true);
    }
  }
  for (const matrix of matrices) expect(matrix).toEqual(matrices[0]);
  expect(writes).toEqual([]);
  const scannerScript = await readFile(
    "node_modules/html5-qrcode/html5-qrcode.min.js",
    "utf8",
  );
  await page.route("**/__qa/qr-style-decoder.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: scannerScript,
    }),
  );
  await page.addScriptTag({ url: "/__qa/qr-style-decoder.js" });
  const checks = await page.evaluate(
    async ({ samples, expected }) => {
      const host = document.createElement("div");
      host.id = "qa-qr-style-decoder";
      host.style.width = "400px";
      document.body.append(host);
      const scanner = new Html5Qrcode(host.id, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      const checks = [];
      try {
        for (const sample of samples) {
          const image = new Image();
          image.src = `data:${sample.type};base64,${sample.data}`;
          await image.decode();
          for (const size of [192, 256, 288, 320, 512, 1024]) {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = size;
            const context = canvas.getContext("2d", {
              willReadFrequently: true,
            });
            context.drawImage(image, 0, 0, size, size);
            const pixels = context.getImageData(0, 0, size, size);
            if (size === 512) {
              const corner = [...pixels.data.slice(0, 4)];
              if (corner[3] !== 255)
                throw new Error("Opaque export lost background");
              if (
                sample.style === "white-black" &&
                corner.slice(0, 3).some((value) => value !== 0)
              )
                throw new Error("Inverted export is not black");
              if (
                sample.style === "black-white" &&
                corner.slice(0, 3).some((value) => value !== 255)
              )
                throw new Error("Monochrome export background is not white");
              if (["black-white", "white-black"].includes(sample.style))
                for (let i = 0; i < pixels.data.length; i += 4) {
                  if (
                    pixels.data[i] !== pixels.data[i + 1] ||
                    pixels.data[i + 1] !== pixels.data[i + 2]
                  )
                    throw new Error(
                      "Monochrome export contains colored pixels",
                    );
                }
            }
            // Inverted payload checks simulate an inversion-capable reader.
            if (sample.style === "white-black") {
              for (let i = 0; i < pixels.data.length; i += 4) {
                pixels.data[i] = 255 - pixels.data[i];
                pixels.data[i + 1] = 255 - pixels.data[i + 1];
                pixels.data[i + 2] = 255 - pixels.data[i + 2];
              }
              context.putImageData(pixels, 0, 0);
            }
            const blob = await new Promise((resolve) => canvas.toBlob(resolve));
            const value = await scanner
              .scanFile(
                new File([blob], "qr.png", { type: "image/png" }),
                false,
              )
              .catch((error) => {
                throw new Error(
                  `${sample.style} ${sample.type} ${size}: ${error}`,
                );
              });
            if (value !== expected)
              throw new Error("Export changed the literal short URL");
            checks.push({
              style: sample.style,
              size,
              type: sample.type,
              value,
            });
          }
        }
      } finally {
        scanner.clear();
        host.remove();
      }
      return checks;
    },
    { samples, expected: link.urlCorta },
  );
  expect(checks).toHaveLength(36);
  await writeFile(
    `${reviewDir}/decode-results.json`,
    JSON.stringify(checks, null, 2),
  );
});

test("panel release history is accessible to every role through the version footer", async ({
  page,
}) => {
  test.setTimeout(150000);
  for (const role of [
    "SEDIPRANO",
    "DIRECTIVA",
    "ADMINISTRADOR",
    "SUPERADMINISTRADOR",
  ]) {
    await setup(page, { role });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/panel");
    const footer = page.locator("footer");
    const manual = footer.getByRole("link", {
      name: "Manual de Usuario",
      exact: true,
    });
    await expect(manual).toHaveAttribute(
      "href",
      "https://drive.google.com/file/d/1qZdcgXCaIopkoSZVI2lcJFaIWFhOrapg/view?usp=sharing",
    );
    await expect(manual).toHaveAttribute("target", "_blank");
    await expect(manual).toHaveAttribute("rel", "noopener noreferrer");
    const version = footer.getByRole("link", {
      name: "Versión 2.4.0",
      exact: true,
    });
    await version.scrollIntoViewIfNeeded();
    await expect(
      footer.getByRole("link", { name: "Reportar", exact: true }),
    ).toHaveAttribute("href", "mailto:ti.sedipro@unitru.edu.pe");
    await expect(
      footer.getByRole("link", { name: "Reportar un problema", exact: true }),
    ).toHaveCount(0);
    await version.click();
    await expect(page).toHaveURL(/\/panel\/versiones$/, { timeout: 30000 });
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Versión 2.4.0 · Sistema web de SEDIPRO UNT",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Versión 0.0.1",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(/Talonarios|encuestas de satisfacción|votación externa/i),
    ).toHaveCount(0);
    const oldestLink = page
      .getByRole("navigation", { name: "Índice de versiones", exact: true })
      .getByRole("link", { name: "v0.0.1", exact: true });
    await oldestLink.click();
    await expect(page).toHaveURL(/#version-0-0-1$/);
    await expect(page.locator("#version-0-0-1")).toBeInViewport();
    await expect(
      page
        .locator("footer")
        .getByRole("link", { name: "Versión 2.4.0", exact: true }),
    ).toHaveAttribute("href", "/panel/versiones");
  }
});

test("panel release footer keeps four mobile icons and a responsive readable history", async ({
  page,
}) => {
  test.setTimeout(180000);
  await setup(page, { role: "SEDIPRANO" });
  const review = ".impeccable/review/panel-versions";
  await mkdir(review, { recursive: true });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    for (const theme of ["light", "dark"]) {
      await page.addInitScript(
        (value) => localStorage.setItem("theme", value),
        theme,
      );
      await page.goto("/panel/versiones");
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: "Versión 2.4.0 · Sistema web de SEDIPRO UNT",
          exact: true,
        }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `${review}/top-${width}-${theme}.png`,
        animations: "disabled",
      });
      if (width < 1024) {
        await page.getByText("Explorar versiones", { exact: true }).click();
        await page
          .getByRole("navigation", {
            name: "Índice de versiones móvil",
            exact: true,
          })
          .getByRole("link", { name: "v0.0.1", exact: true })
          .click();
        await expect(page.locator("#version-0-0-1")).toBeInViewport();
      }
      const footer = page.locator("footer");
      await footer.scrollIntoViewIfNeeded();
      const boxes = [];
      for (const name of [
        "Documentación",
        "Manual de Usuario",
        "Reportar",
        "Versión 2.4.0",
      ]) {
        const link = footer.getByRole("link", { name, exact: true });
        await expect(link).toBeVisible();
        const box = await link.boundingBox();
        boxes.push(box);
        const labelWidth = await link
          .locator("span")
          .evaluate((element) => element.getBoundingClientRect().width);
        if (width < 768) {
          await expect(link.locator("svg")).toBeVisible();
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(labelWidth).toBeLessThanOrEqual(1);
        } else {
          await expect(link.locator("svg")).toBeHidden();
          expect(labelWidth).toBeGreaterThan(20);
        }
      }
      expect(
        Math.max(...boxes.map((box) => box.y)) -
          Math.min(...boxes.map((box) => box.y)),
      ).toBeLessThanOrEqual(1);
      const brand = await footer.locator(":scope > span").boundingBox();
      expect(brand.x + brand.width).toBeLessThanOrEqual(boxes[0].x);
      expect(boxes.at(-1).x + boxes.at(-1).width).toBeLessThanOrEqual(width);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `${review}/footer-${width}-${theme}.png`,
        animations: "disabled",
      });
    }
  }
});

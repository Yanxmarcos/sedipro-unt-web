import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
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

test("certificate audit history supports mobile themes, search and confirmed row cleanup", async ({
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
  await page.route("**/api/certificados/auditoria**", async (route) => {
    if (route.request().method() === "DELETE") {
      deletes.push(route.request().postDataJSON());
      rows = rows.filter((row) => !route.request().url().endsWith(row._id));
      return route.fulfill({ json: { eliminados: 1 } });
    }
    const q = new URL(route.request().url()).searchParams.get("q");
    const data = rows.filter((row) => !q || row.proyecto?.includes(q));
    return route.fulfill({
      json: { data, pagination: { page: 1, pages: 1, total: data.length } },
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
  }
});

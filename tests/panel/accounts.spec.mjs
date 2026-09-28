import { test, expect } from "@playwright/test";

const member = {
  _id: "111111111111111111111111",
  nombres: "Ana",
  apellidos: "Prueba",
  dni: "12345678",
  area: "TI",
  carrera: "Ingeniería de sistemas",
  codigoMatricula: "20260001",
  activo: true,
  telefono: "",
  correoInstitucional: "ana.prueba@unitru.edu.pe",
  fotoPerfil: {
    url: "/logos/logo-ti.jpg",
    fileKey: "foto-ana-prueba",
  },
};
const attendance = {
  _id: "333333333333333333333333",
  descripcion: "Reunión de prueba",
  fecha: "2026-09-27T15:00:00.000Z",
  resumen: { presentes: 0, tardanzas: 0, ausentes: 1 },
  registro: [
    {
      sedipranoId: member._id,
      estado: "ausente",
      hora: null,
      registradoPor: null,
      sediprano: member,
    },
  ],
};

async function mockPanel(
  page,
  {
    role = "DIRECTIVA",
    assignments = [],
    forced = false,
    voteError = false,
    attendanceManagers = [],
  } = {},
) {
  const state = {
    role,
    assignments,
    forced,
    voteError,
    voted: false,
    writes: [],
    errors: [],
    unexpected: [],
  };
  page.on("pageerror", (error) => state.errors.push(error.message));
  await page.context().addCookies([
    {
      name: "auth_token",
      value: "local-synthetic-session",
      url: "http://127.0.0.1:7010",
    },
  ]);
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== "http://127.0.0.1:7010") return route.abort();
    if (!url.pathname.startsWith("/api/")) return route.continue();
    const path = url.pathname;
    const method = route.request().method();
    const reply = (body, status = 200) => route.fulfill({ status, json: body });
    if (path === "/api/sessions/heartbeat" && method === "POST")
      return reply({
        success: true,
        tracked: true,
        lastSeenAt: "2026-09-27T17:30:00.000Z",
      });
    if (method !== "GET") {
      state.writes.push({ path, method, body: route.request().postDataJSON() });
      if (path.endsWith("/votar")) state.voted = true;
      if (path === "/api/auth/change-password") state.forced = false;
      if (path === "/api/sedipranos" && method === "POST")
        return reply({
          data: { ...member, ...route.request().postDataJSON() },
          success: true,
        });
      return reply({
        success: true,
        data: member,
        message: "Registrado correctamente",
        sediprano: member,
      });
    }
    if (path === "/api/auth/verify")
      return reply({
        authenticated: true,
        user: {
          id: "222222222222222222222222",
          ...member,
          sedipranoId: member._id,
          rol: state.role,
          mustChangePassword: state.forced,
        },
      });
    if (path === "/api/mi/asistencias")
      return reply({ data: state.assignments });
    if (path === "/api/asistencias")
      return reply({
        asistencias: [{ ...attendance, encargados: attendanceManagers }],
      });
    if (path === "/api/dashboard")
      return reply({
        success: true,
        data: {
          usuarios: { total: 2, activos: 2 },
          asistencias: { total: 0 },
          votaciones: { total: 0 },
          eventos: { total: 0 },
        },
      });
    if (path === "/api/users")
      return reply({
        data: [
          {
            ...member,
            _id: "444444444444444444444444",
            sedipranoId: member,
            rol: "SEDIPRANO",
            active: true,
            createdAt: "2026-09-26T12:00:00.000Z",
          },
        ],
      });
    if (path === "/api/sedipranos")
      return reply({
        data: [
          {
            ...member,
            account: {
              id: "444444444444444444444444",
              rol: "SEDIPRANO",
              active: true,
              createdAt: "2026-09-26T12:00:00.000Z",
            },
          },
        ],
      });
    if (path === "/api/uploadthing")
      return reply([
        {
          slug: "fotoPerfil",
          config: {
            image: { maxFileSize: "4MB", maxFileCount: 1, minFileCount: 1 },
          },
        },
      ]);
    if (path === "/api/mi/votaciones") {
      if (state.voteError)
        return reply({ message: "No se pudieron cargar las votaciones" }, 503);
      return reply({
        linked: true,
        data: [
          {
            _id: "555555555555555555555555",
            titulo: "Votación de prueba",
            opciones: ["Sí", "No"],
            asistencia: attendance.descripcion,
            eligible: true,
            yaVoto: state.voted,
          },
        ],
      });
    }
    if (path === "/api/asistencias/" + attendance._id)
      return reply({ asistencia: attendance });
    if (path === "/api/profile/me")
      return reply({
        data: {
          ...member,
          linked: true,
          rol: state.role,
          accountCreatedAt: "2026-09-26T12:00:00.000Z",
        },
      });
    if (path === "/api/eventos")
      return reply({
        data: [
          {
            _id: "666666666666666666666666",
            titulo: "Evento de prueba",
            estado: "borrador",
            fechaInicio: attendance.fecha,
            totalInscripciones: 4,
            totalAsistencias: 1,
          },
        ],
      });
    if (path === "/api/sessions")
      return reply({
        success: true,
        total: 2,
        active: 1,
        generatedAt: "2026-09-27T17:30:00.000Z",
        data: [
          {
            id: "222222222222222222222222",
            user: member.dni,
            nombres: member.nombres,
            apellidos: member.apellidos,
            dni: member.dni,
            rol: state.role,
            accountActive: true,
            active: true,
            lastLogin: "2026-09-27T17:00:00.000Z",
            signedInAt: "2026-09-27T17:00:00.000Z",
            lastSeenAt: "2026-09-27T17:29:30.000Z",
          },
          {
            id: "777777777777777777777777",
            user: "87654321",
            nombres: "Luis",
            apellidos: "Ejemplo",
            dni: "87654321",
            rol: "SEDIPRANO",
            accountActive: true,
            active: false,
            lastLogin: "2026-09-26T12:00:00.000Z",
            signedInAt: "2026-09-26T12:00:00.000Z",
            lastSeenAt: "2026-09-26T12:15:00.000Z",
          },
        ],
      });
    state.unexpected.push(path);
    return reply({ message: "API sin simulación: " + path }, 501);
  });
  return state;
}

test("Directiva gestiona fichas y estados sin asignar roles", async ({
  page,
}) => {
  const state = await mockPanel(page);
  await page.goto("/panel/usuarios");
  await expect(
    page.getByRole("cell", { name: "Ana Prueba Sin teléfono" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Usuarios", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Gestionar rol de/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Desactivar Ana Prueba" }).click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect.poll(() => state.writes.length).toBe(1);
  expect(state.writes[0]).toMatchObject({
    path: "/api/sedipranos",
    method: "PATCH",
    body: { sedipranoId: member._id, activo: false },
  });
  await page.getByRole("button", { name: "Nuevo sediprano" }).click();
  await expect(
    page.getByLabel("Teléfono (opcional)", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Crear sediprano y cuenta" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Código de matrícula", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Nombres", { exact: true }).fill("Lucía");
  await page.getByLabel("Apellidos", { exact: true }).fill("Ejemplo");
  await page.getByLabel("DNI", { exact: true }).fill("87654321");
  await page.getByRole("combobox", { name: "Área", exact: true }).click();
  await page.getByRole("option", { name: "PMO", exact: true }).click();
  await page.getByRole("combobox", { name: "Carrera", exact: true }).click();
  await page
    .getByRole("option", { name: "INGENIERÍA DE SISTEMAS", exact: true })
    .click();
  await page.getByRole("button", { name: "Crear sediprano y cuenta" }).click();
  await expect(page.getByText(/Cuenta creada. El usuario/)).toBeVisible();
  expect(state.writes[1]).toMatchObject({
    path: "/api/sedipranos",
    method: "POST",
    body: { nombres: "Lucía", area: "PMO", dni: "87654321" },
  });
  await expect(page.getByRole("button", { name: "Subir foto" })).toBeEnabled();
  expect(state.errors).toEqual([]);
  expect(state.unexpected).toEqual([]);
});

test("Usuarios y sedipranos muestran el correo institucional en su ficha", async ({
  page,
}) => {
  const state = await mockPanel(page);

  for (const path of ["/panel/usuarios", "/panel/sedipranos"]) {
    await page.goto(path);
    await page.getByRole("button", { name: "Ver ficha de Ana Prueba" }).click();
    await expect(page.getByText("Correo institucional")).toBeVisible();
    await expect(page.getByText("ana.prueba@unitru.edu.pe")).toBeVisible();
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Editar ficha de Ana Prueba" })
      .click();
    await expect(
      page.getByLabel("Correo institucional", { exact: true }),
    ).toHaveValue("ana.prueba@unitru.edu.pe");
    await page.keyboard.press("Escape");
  }

  expect(state.errors).toEqual([]);
  expect(state.unexpected).toEqual([]);
});

test("Superadministrador puede asignar rol independiente del área", async ({
  page,
}) => {
  const state = await mockPanel(page, { role: "SUPERADMINISTRADOR" });
  await page.goto("/panel/usuarios");
  await page
    .getByRole("button", { name: "Gestionar rol de Ana Prueba" })
    .click();
  await page.getByRole("combobox", { name: "Rol del sistema" }).click();
  await expect(
    page.getByRole("option", { name: "Superadministrador" }),
  ).toHaveCount(0);
  await page
    .getByRole("option", { name: "Administrador", exact: true })
    .click();
  await page.getByRole("button", { name: "Guardar rol" }).click();
  await expect.poll(() => state.writes.length).toBe(1);
  expect(state.writes[0].body).toEqual({
    userId: "444444444444444444444444",
    rol: "ADMINISTRADOR",
  });
  expect(state.errors).toEqual([]);
});

test("Sediprano accede solo a sus opciones y toma asistencia asignada", async ({
  page,
}) => {
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  const state = await mockPanel(page, {
    role: "SEDIPRANO",
    assignments: [attendance],
  });
  await page.goto("/panel");
  await expect(page.getByRole("heading", { name: "Hola, Ana" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Usuarios", exact: true }),
  ).toHaveCount(0);
  await page.goto("/panel/sedipranos");
  await expect(
    page.getByText("Tu cuenta no tiene acceso a esta sección."),
  ).toBeVisible();
  await page.goto("/panel/asistencias/tomar/" + attendance._id);
  await page.getByLabel("DNI", { exact: true }).fill("87654321");
  await page.getByRole("button", { name: "Registrar", exact: true }).click();
  await expect.poll(() => state.writes.length).toBe(1);
  expect(state.writes[0].body).toEqual({ dni: "87654321", estado: "presente" });
  await expect(page.getByLabel("DNI", { exact: true })).toHaveValue("");
  expect(state.errors).toEqual([]);
  expect(state.unexpected).toEqual([]);
  expect(
    consoleErrors.filter((message) =>
      message.includes("expected a native <button>"),
    ),
  ).toEqual([]);
});

test("El selector de encargados muestra la foto del sediprano", async ({
  page,
}) => {
  const state = await mockPanel(page);

  await page.goto("/panel/asistencias");
  await page.getByRole("button", { name: "Sin asignación" }).click();
  await page.getByRole("button", { name: "Agregar encargado" }).click();

  const candidate = page.getByRole("button", { name: /Ana Prueba/ });
  await expect(candidate).toBeVisible();
  await expect(
    candidate.getByRole("img", { name: "Ana Prueba" }),
  ).toHaveAttribute("src", /logo-ti\.jpg/);

  expect(state.errors).toEqual([]);
  expect(state.unexpected).toEqual([]);
});

test("La tabla y la lista de encargados muestran sus fotos", async ({
  page,
}) => {
  const assignedManager = {
    _id: "888888888888888888888888",
    sedipranoId: member._id,
    nombres: member.nombres,
    apellidos: member.apellidos,
    dni: member.dni,
    fotoPerfil: member.fotoPerfil,
  };
  const state = await mockPanel(page, {
    attendanceManagers: [assignedManager],
  });

  await page.goto("/panel/asistencias");
  const preview = page.getByTitle("Ver encargados (1)");
  await expect(
    preview.getByRole("img", { name: "Ana Prueba" }),
  ).toHaveAttribute("src", /logo-ti\.jpg/);
  await preview.click();
  await expect(page.getByText("Encargados de asistencia")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Ana Prueba" }),
  ).toHaveAttribute("src", /logo-ti\.jpg/);

  await page.goto("/panel/asistencias/" + attendance._id);
  await expect(
    page
      .getByRole("row", { name: /Ana Prueba/ })
      .getByRole("img", { name: "Ana Prueba" }),
  ).toHaveAttribute("src", /logo-ti\.jpg/);

  expect(state.errors).toEqual([]);
  expect(state.unexpected).toEqual([]);
});

test("Votar exige confirmar y envía la elección sin suplantar identidad", async ({
  page,
}) => {
  const state = await mockPanel(page, { role: "SEDIPRANO", voteError: true });
  await page.goto("/panel/votaciones/votar");
  await expect(
    page.getByText("No se pudieron cargar las votaciones"),
  ).toBeVisible();
  state.voteError = false;
  await page.getByRole("button", { name: /Reintentar/ }).click();
  await page.getByRole("radio", { name: "Sí", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirmar voto", exact: true })
    .click();
  expect(state.writes).toHaveLength(0);
  await page.getByRole("button", { name: "Enviar voto" }).click();
  await expect(
    page.getByText("Tu participación ya está registrada. Gracias por votar."),
  ).toBeVisible();
  expect(state.writes[0].body).toEqual({ opcionSeleccionada: "Sí" });
  expect(state.errors).toEqual([]);
});

test("Primer ingreso obliga a reemplazar la contraseña inicial", async ({
  page,
}) => {
  const state = await mockPanel(page, { role: "SEDIPRANO", forced: true });
  await page.goto("/panel/votaciones/votar");
  await expect(page).toHaveURL(/cambiar-contrasena/);
  await page.getByLabel("Contraseña actual", { exact: true }).fill("12345678");
  await page.getByLabel("Nueva contraseña", { exact: true }).fill("12345678");
  await page
    .getByLabel("Confirmar nueva contraseña", { exact: true })
    .fill("12345678");
  await page.getByRole("button", { name: "Actualizar contraseña" }).click();
  await expect(
    page.getByText(
      "Elige una contraseña diferente a tu DNI y a la contraseña actual.",
    ),
  ).toBeVisible();
  expect(state.writes).toHaveLength(0);
  await page
    .getByLabel("Nueva contraseña", { exact: true })
    .fill("OtraClave2026!");
  await page
    .getByLabel("Confirmar nueva contraseña", { exact: true })
    .fill("OtraClave2026!");
  await page.getByRole("button", { name: "Actualizar contraseña" }).click();
  await expect(page.getByRole("heading", { name: "Hola, Ana" })).toBeVisible();
  expect(state.writes[0].body).toEqual({
    currentPassword: "12345678",
    newPassword: "OtraClave2026!",
  });
  expect(state.errors).toEqual([]);
});

test("Tabla y perfil no desbordan en móvil ni en tema oscuro", async ({
  page,
}, testInfo) => {
  const state = await mockPanel(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/panel/usuarios");
  await expect(
    page.getByRole("button", { name: "Nuevo sediprano" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Cambiar tema" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({
    path: testInfo.outputPath("usuarios-movil-oscuro.png"),
    fullPage: true,
    animations: "disabled",
  });
  const rowColor = await page
    .locator("td")
    .first()
    .evaluate((element) => getComputedStyle(element).color);
  const headingColor = await page
    .getByRole("heading", { name: "Usuarios", exact: true })
    .evaluate((element) => getComputedStyle(element).color);
  expect(rowColor).toBe(headingColor);
  const search = page.getByRole("textbox", {
    name: "Buscar por nombre, DNI, carrera o matrícula",
  });
  const inputBox = await search.boundingBox();
  const iconBox = await search.locator("..").locator("svg").boundingBox();
  expect(inputBox.x).toBeGreaterThanOrEqual(iconBox.x + iconBox.width);
  await page.goto("/panel/perfil");
  await expect(page.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
  await expect(
    page.getByLabel("Código de matrícula (opcional)", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Seleccionar foto de perfil").setInputFiles({
    name: "no-es-foto.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("prueba local"),
  });
  await expect(
    page.getByText("Selecciona una imagen JPG, PNG o WebP."),
  ).toBeVisible();
  await page.getByLabel("Seleccionar foto de perfil").setInputFiles({
    name: "foto-muy-pesada.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(4 * 1024 * 1024 + 1),
  });
  await expect(
    page.getByText("La foto debe pesar como máximo 4 MB."),
  ).toBeVisible();
  expect(state.writes).toHaveLength(0);

  const enrollmentCode = page.getByLabel("Código de matrícula (opcional)", {
    exact: true,
  });
  await enrollmentCode.fill("20A260001");
  await expect(enrollmentCode).toHaveValue("20260001");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  await expect(
    page.getByText("El código de matrícula debe tener exactamente 10 dígitos."),
  ).toBeVisible();
  expect(state.writes).toHaveLength(0);

  await enrollmentCode.fill("20A260001999");
  await expect(enrollmentCode).toHaveValue("2026000199");
  const institutionalEmail = page.getByLabel("Correo institucional", {
    exact: true,
  });
  await institutionalEmail.fill("correo-invalido");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  await expect(
    page.getByText("Ingresa un correo institucional válido."),
  ).toBeVisible();
  expect(state.writes).toHaveLength(0);
  await institutionalEmail.fill("ana.prueba@unitru.edu.pe");
  await enrollmentCode.clear();
  const phone = page.getByLabel("Teléfono (opcional)", { exact: true });
  await phone.fill("99A988877766");
  await expect(phone).toHaveValue("999888777");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  await expect.poll(() => state.writes.length).toBe(1);
  expect(state.writes[0]).toMatchObject({
    path: "/api/profile/me",
    method: "PATCH",
    body: {
      telefono: "999888777",
      codigoMatricula: "",
      correoInstitucional: "ana.prueba@unitru.edu.pe",
    },
  });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("perfil-movil.png"),
    fullPage: true,
    animations: "disabled",
  });
  expect(state.errors).toEqual([]);
  expect(state.unexpected).toEqual([]);
});

test("Solo administración dispone de eliminar eventos", async ({ page }) => {
  const state = await mockPanel(page);
  await page.goto("/panel/eventos");
  await expect(
    page.getByRole("heading", { name: "Evento de prueba" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Eliminar Evento de prueba" }),
  ).toHaveCount(0);
  state.role = "ADMINISTRADOR";
  await page.reload();
  await page.getByRole("button", { name: "Eliminar Evento de prueba" }).click();
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect.poll(() => state.writes.length).toBe(1);
  expect(state.writes[0]).toMatchObject({
    method: "DELETE",
    path: "/api/eventos/666666666666666666666666",
  });
  expect(state.errors).toEqual([]);
});

test("Superadministración consulta sesiones y dispone de los enlaces del pie", async ({
  page,
}, testInfo) => {
  const state = await mockPanel(page, { role: "SUPERADMINISTRADOR" });

  await page.goto("/panel/sesiones");

  await expect(page.getByRole("heading", { name: "Sesiones" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sesiones" })).toBeVisible();
  await expect(page.getByText("Activos ahora")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Ana Prueba" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Luis Ejemplo" })).toBeVisible();

  await expect(
    page.getByRole("link", { name: "TI", exact: true }),
  ).toHaveAttribute("href", "/tecnologias-de-la-informacion");
  await expect(
    page.getByRole("link", { name: "Documentación" }),
  ).toHaveAttribute("href", "https://api-sediprount.vercel.app");
  const reportLink = page.getByRole("link", { name: "Reportar un problema" });
  await expect(reportLink).toHaveAttribute(
    "href",
    "mailto:ti.sedipro@unitru.edu.pe",
  );
  await reportLink.hover();
  await expect(
    page.getByText("Escríbenos a esta dirección de email"),
  ).toBeVisible();

  await page.screenshot({
    path: testInfo.outputPath("sesiones-superadministracion.png"),
    fullPage: true,
    animations: "disabled",
  });
  expect(state.errors).toEqual([]);
  expect(state.unexpected).toEqual([]);
});

test("Directiva no ve ni puede abrir el apartado de sesiones", async ({
  page,
}) => {
  const state = await mockPanel(page, { role: "DIRECTIVA" });

  await page.goto("/panel");
  await expect(page.getByRole("link", { name: "Sesiones" })).toHaveCount(0);

  await page.goto("/panel/sesiones");
  await expect(
    page.getByText("Tu cuenta no tiene acceso a esta sección."),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sesiones" })).toHaveCount(0);

  expect(state.errors).toEqual([]);
  expect(state.unexpected).toEqual([]);
});

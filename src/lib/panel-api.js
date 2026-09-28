export async function panelApi(path, options = {}) {
  const { body, ...rest } = options;
  let response;
  try {
    response = await fetch(path, {
      ...rest,
      cache: "no-store",
      credentials: "include",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...rest.headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.",
    );
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (typeof window !== "undefined" && response.status === 401) {
      window.dispatchEvent(new Event("panel:session-changed"));
    }
    if (
      result.code === "PASSWORD_CHANGE_REQUIRED" &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new Event("panel:session-changed"));
    }
    const error = new Error(
      result.message || result.error || "No se pudo completar la operación.",
    );
    error.status = response.status;
    throw error;
  }

  return result;
}

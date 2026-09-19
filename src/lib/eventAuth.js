import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function requireEventManager() {
  const token = (await cookies()).get("auth_token")?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return { error: "No autorizado", status: 401 };
  if (!["ADMIN", "DIRECTIVA"].includes(user.rol))
    return {
      error: "No tienes permisos para administrar eventos",
      status: 403,
    };
  return { user };
}

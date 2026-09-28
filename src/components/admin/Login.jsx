"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import Logo from "@/components/admin-shared/Logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const settings = {
  admin: {
    title: "Iniciar sesión",
    description: "Accede al panel interno de SEDIPRO UNT.",
    endpoint: "/api/auth/login",
    userLabel: "Usuario",
    userPlaceholder: "Ingresa tu usuario",
  },
  encargado: {
    title: "Acceso de encargados",
    description: "Registro de asistencia de SEDInvita.",
    endpoint: "/api/sedinvita/encargados-asistencia/login",
    userLabel: "DNI",
    userPlaceholder: "Ingresa tu DNI",
  },
  facilitador: {
    title: "Acceso de facilitadores",
    description: "Evaluación de grupos de SEDInvita.",
    endpoint: "/api/sedinvita/facilitadores/login",
    userLabel: "DNI",
    userPlaceholder: "Ingresa tu DNI",
  },
};

const fieldClass =
  "h-12 rounded-none border-2 border-black bg-white px-4 text-base text-black shadow-[4px_4px_0_#000] outline-none placeholder:text-black/40 focus-visible:border-black focus-visible:ring-0 focus-visible:shadow-[4px_4px_0_#737373]";

export default function Login({ kind = "admin" }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnos, setTurnos] = useState(null);
  const current = settings[kind];

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body =
        kind === "admin"
          ? { username: username.trim(), password }
          : { dni: username.trim(), password };

      const response = await fetch(current.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "No se pudo iniciar sesión",
        );
      }

      if (kind === "encargado") {
        const available = data.data?.turnos || [];
        if (available.length === 1) {
          router.push(`/sedinvita/registro/${available[0]._id}`);
        } else {
          setTurnos(available);
        }
      } else if (kind === "facilitador") {
        router.push("/sedinvita/facilitador/evaluar");
      } else {
        router.push(data.redirectTo || "/panel");
      }

      router.refresh();
    } catch (failure) {
      setError(failure.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="admin-root relative min-h-screen overflow-hidden bg-[#070707] text-white"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.13) 1.2px, transparent 1.2px)",
        backgroundSize: "24px 24px",
      }}
    >
      <main className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_460px] lg:gap-16 lg:py-14">
        <section className="order-2 flex min-w-0 flex-col items-center self-end text-center lg:order-1 lg:items-start lg:self-center lg:text-left">
          <div className="mb-3 hidden border-2 border-white bg-black px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.18em] shadow-[4px_4px_0_rgba(255,255,255,0.28)] lg:block">
            <Link href="/">SEDIPRO UNT</Link>
          </div>

          <div className="relative flex w-full max-w-xl items-end justify-center lg:justify-start">
            <div
              className="absolute bottom-6 left-1/2 h-52 w-52 -translate-x-1/2 border-2 border-white/25 lg:left-8 lg:h-72 lg:w-72 lg:translate-x-0"
              aria-hidden="true"
            />
            <Image
              src="/img/hito6.webp"
              alt="Hito, mascota de SEDIPRO UNT, dando la bienvenida"
              width={720}
              height={720}
              priority
              className="relative z-10 h-auto w-60 drop-shadow-[10px_12px_0_rgba(0,0,0,0.65)] sm:w-72 lg:w-[500px]"
            />
          </div>

          <div className="relative z-20 -mt-3 max-w-lg border-2 border-white bg-black px-5 py-4 shadow-[6px_6px_0_rgba(255,255,255,0.22)] lg:-mt-8">
            <p className="text-lg font-black uppercase tracking-tight sm:text-xl">
              Bienvenido a tu espacio sediprano
            </p>
            <p className="mt-1 text-sm text-white/65">
              Organiza, participa y mantente conectado con el equipo.
            </p>
          </div>
        </section>

        <Card className="order-1 relative w-full gap-0 overflow-visible rounded-none border-[3px] border-black bg-[#f4f1ea] py-0 text-black shadow-[12px_12px_0_#5f5f5f] ring-0 lg:order-2">
          <span className="absolute -right-[3px] -top-9 border-[3px] border-b-0 border-black bg-black px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white">
            / acceso
          </span>

          <CardHeader className="gap-6 rounded-none border-b-[3px] border-black px-6 py-7 sm:px-8">
            <Logo className="gap-3 [&_img]:size-10" />
            <div>
              <h1 className="mb-2 font-sans text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">
                {current.title}
              </h1>
              <CardDescription className="text-base text-black/65">
                {current.description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-6 py-7 sm:px-8 sm:py-8">
            {turnos ? (
              <div className="space-y-4">
                <p className="font-black uppercase tracking-wide">
                  Selecciona un turno
                </p>
                {turnos.map((turno) => (
                  <Button
                    key={turno._id}
                    variant="outline"
                    className="h-auto w-full justify-start rounded-none border-2 border-black bg-white px-4 py-3 text-black shadow-[4px_4px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-white hover:shadow-[2px_2px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
                    onClick={() =>
                      router.push(`/sedinvita/registro/${turno._id}`)
                    }
                  >
                    {turno.nombre || `Turno ${turno.fase}`}
                  </Button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="block text-xs font-black uppercase tracking-[0.14em]"
                  >
                    {current.userLabel}
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    placeholder={current.userPlaceholder}
                    className={fieldClass}
                    disabled={loading}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-xs font-black uppercase tracking-[0.14em]"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      placeholder="Ingresa tu contraseña"
                      className={`${fieldClass} pr-12`}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center border-2 border-transparent text-black transition-colors hover:border-black focus-visible:border-black focus-visible:outline-none"
                      onClick={() => setShowPassword((visible) => !visible)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="border-2 border-black bg-white px-4 py-3 text-sm font-semibold text-black shadow-[4px_4px_0_#000]"
                  >
                    {error}
                  </p>
                )}

                <Button
                  className="h-[3.25rem] w-full rounded-none border-2 border-black bg-black px-5 text-base font-black uppercase tracking-[0.08em] text-white shadow-[7px_7px_0_#666] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-black hover:shadow-[4px_4px_0_#666] active:translate-x-[7px] active:translate-y-[7px] active:shadow-none"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      Ingresando…
                    </>
                  ) : (
                    <>
                      Ingresar
                      <ArrowRight />
                    </>
                  )}
                </Button>

                <p className="border-t-2 border-black pt-5 text-center font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-black/55">
                  Acceso exclusivo para miembros autorizados
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { usePanelSession } from "./panel-session";
import { formatSessionTime, remainingSessionSeconds } from "@/lib/auth-session.mjs";

export function SessionCountdown() {
  const { deadline } = usePanelSession();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!deadline) return;
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
    };
  }, [deadline]);
  if (!deadline) return null;
  const seconds = remainingSessionSeconds(deadline, now);
  return (
    <div className={`flex shrink-0 items-center gap-1.5 text-xs ${seconds <= 300 ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"}`}
      title="Tiempo restante de tu sesión">
      <Clock3 className="size-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Sesión</span>
      <span role="timer" aria-label="Tiempo restante de sesión" aria-live="off" className="font-medium tabular-nums">
        {formatSessionTime(seconds)}
      </span>
    </div>
  );
}

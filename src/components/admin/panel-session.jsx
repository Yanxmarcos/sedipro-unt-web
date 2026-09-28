"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { panelPermissions } from "@/lib/panel-permissions.mjs";

const PanelSessionContext = createContext(null);

export function PanelSessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        cache: "no-store",
        credentials: "include",
      });
      const result = await response.json();
      if (response.status === 401 || response.status === 403) {
        setUser(null);
        setAuthenticated(false);
        setAssignments([]);
        setError("");
        return;
      }
      if (!response.ok)
        throw new Error(result.message || "No se pudo verificar la sesión.");

      setUser(result.user);
      setAuthenticated(true);
      setError("");
      if (result.user?.sedipranoId && !result.user.mustChangePassword) {
        const assignedResponse = await fetch("/api/mi/asistencias", {
          cache: "no-store",
        });
        if (assignedResponse.ok) {
          const assigned = await assignedResponse.json();
          setAssignments(assigned.data || []);
        } else {
          setAssignments([]);
        }
      } else {
        setAssignments([]);
      }
    } catch (failure) {
      setError(failure.message || "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("panel:session-changed", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("panel:session-changed", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  useEffect(() => {
    if (!authenticated || user?.mustChangePassword) return;

    let lastInteractionAt = Date.now();
    const markInteraction = () => {
      lastInteractionAt = Date.now();
    };
    const heartbeat = () => {
      const recentlyActive = Date.now() - lastInteractionAt < 2 * 60 * 1000;
      if (document.visibilityState !== "visible" || !recentlyActive) return;
      fetch("/api/sessions/heartbeat", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      }).catch(() => {});
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        markInteraction();
        heartbeat();
      }
    };
    const activityEvents = ["pointerdown", "keydown", "scroll", "touchstart"];

    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, markInteraction, { passive: true }),
    );
    document.addEventListener("visibilitychange", handleVisibility);
    heartbeat();
    const interval = window.setInterval(heartbeat, 60 * 1000);

    return () => {
      window.clearInterval(interval);
      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, markInteraction),
      );
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [authenticated, user?.mustChangePassword]);

  return (
    <PanelSessionContext.Provider
      value={{
        user,
        assignments,
        loading,
        error,
        authenticated,
        refresh,
        permissions: panelPermissions(user),
      }}
    >
      {children}
    </PanelSessionContext.Provider>
  );
}

export function usePanelSession() {
  const context = useContext(PanelSessionContext);
  if (!context)
    throw new Error("El componente debe estar dentro de PanelSessionProvider.");
  return context;
}

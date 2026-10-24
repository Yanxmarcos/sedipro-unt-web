"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { panelPermissions } from "@/lib/panel-permissions.mjs";
import { sessionDeadline } from "@/lib/auth-session.mjs";

const PanelSessionContext = createContext(null);

export function PanelSessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [deadline, setDeadline] = useState(null);
  const refreshVersion = useRef(0);

  const refresh = useCallback(async () => {
    const version = ++refreshVersion.current;
    const startedAt = Date.now();
    try {
      const response = await fetch("/api/auth/verify", {
        cache: "no-store",
        credentials: "include",
      });
      const result = await response.json();
      if (version !== refreshVersion.current) return;
      if (response.status === 401 || response.status === 403) {
        setUser(null);
        setAuthenticated(false);
        setAssignments([]);
        setError("");
        setDeadline(null);
        return;
      }
      if (!response.ok)
        throw new Error(result.message || "No se pudo verificar la sesión.");

      const nextDeadline = sessionDeadline(result.session, startedAt, Date.now());
      if (nextDeadline !== null && nextDeadline <= Date.now()) {
        setUser(null);
        setAuthenticated(false);
        setAssignments([]);
        setDeadline(null);
        setError("");
        return;
      }
      setDeadline(nextDeadline);
      setUser(result.user);
      setAuthenticated(true);
      setError("");
      if (result.user?.sedipranoId && !result.user.mustChangePassword) {
        const assignedResponse = await fetch("/api/mi/asistencias", {
          cache: "no-store",
        });
        if (version !== refreshVersion.current) return;
        if (assignedResponse.ok) {
          const assigned = await assignedResponse.json();
          if (version !== refreshVersion.current) return;
          setAssignments(assigned.data || []);
        } else {
          setAssignments([]);
        }
      } else {
        setAssignments([]);
      }
    } catch (failure) {
      if (version === refreshVersion.current)
        setError(failure.message || "No se pudo conectar con el servidor.");
    } finally {
      if (version === refreshVersion.current) setLoading(false);
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
    if (!authenticated || deadline === null) return;
    const timer = window.setTimeout(() => {
      ++refreshVersion.current;
      setAuthenticated(false);
      setUser(null);
      setAssignments([]);
      setDeadline(null);
      setError("");
      setLoading(false);
    }, Math.max(0, deadline - Date.now()));
    return () => window.clearTimeout(timer);
  }, [authenticated, deadline]);

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
        deadline,
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

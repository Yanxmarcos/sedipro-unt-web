"use client";

import { AlertCircle, Inbox, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageLoading({ label = "Cargando información…" }) {
  return (
    <div
      role="status"
      className="flex min-h-48 items-center justify-center gap-3 p-6 text-sm text-muted-foreground"
    >
      <LoaderCircle className="size-5 animate-spin" />
      {label}
    </div>
  );
}

export function PageError({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center"
    >
      <AlertCircle className="size-6 text-destructive" />
      <p className="max-w-lg text-sm">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Reintentar
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, icon: Icon = Inbox }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div className="rounded-lg bg-muted p-3">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <p className="font-medium">{title}</p>
      {description && (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, RefreshCw, Vote } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmptyState,
  PageError,
  PageLoading,
} from "@/components/admin/page-state";
import { panelApi } from "@/lib/panel-api";

function VoteCard({ vote, onVoted }) {
  const [selection, setSelection] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function sendVote() {
    if (sending) return;
    setSending(true);
    setError("");
    try {
      await panelApi("/api/votaciones/" + vote._id + "/votar", {
        method: "POST",
        body: { opcionSeleccionada: selection },
      });
      toast.success("Tu voto fue registrado.");
      setConfirming(false);
      await onVoted();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Vote className="size-5 text-muted-foreground" />
          <Badge variant="secondary">
            {vote.yaVoto ? "Voto registrado" : "Abierta"}
          </Badge>
        </div>
        <CardTitle className="break-words text-lg">{vote.titulo}</CardTitle>
        <CardDescription>
          {vote.asistencia}
          {vote.fechaCierre && (
            <span className="mt-1 block">
              Cierra: {new Date(vote.fechaCierre).toLocaleString("es-PE")}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {vote.yaVoto ? (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
            <CheckCircle2 className="size-5 shrink-0" />
            <p className="text-sm">
              Tu participación ya está registrada. Gracias por votar.
            </p>
          </div>
        ) : !vote.eligible ? (
          <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            {vote.motivo}
          </p>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (selection) setConfirming(true);
            }}
            className="space-y-5"
          >
            <RadioGroup
              value={selection}
              onValueChange={setSelection}
              aria-label={"Opciones de " + vote.titulo}
            >
              {vote.opciones.map((option, index) => (
                <Label
                  key={option}
                  htmlFor={vote._id + "-" + index}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-data-checked:border-primary has-data-checked:bg-muted/50"
                >
                  <RadioGroupItem
                    id={vote._id + "-" + index}
                    value={option}
                    className="mt-0.5 shrink-0"
                  />
                  <span className="break-words leading-relaxed">{option}</span>
                </Label>
              ))}
            </RadioGroup>
            <Button type="submit" disabled={!selection}>
              <Vote /> Confirmar voto
            </Button>
          </form>
        )}
      </CardContent>
      <Dialog
        open={confirming}
        onOpenChange={(open) => {
          if (!sending) setConfirming(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar tu voto</DialogTitle>
            <DialogDescription>
              Tu voto no se podrá cambiar después de enviarlo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">{vote.titulo}</p>
            <p className="break-words font-medium">{selection}</p>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={sending}
              onClick={() => setConfirming(false)}
            >
              Revisar elección
            </Button>
            <Button disabled={sending} onClick={sendVote}>
              {sending && <LoaderCircle className="animate-spin" />}
              {sending ? "Enviando…" : "Enviar voto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function VotarPage() {
  const [data, setData] = useState([]);
  const [linked, setLinked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await panelApi("/api/mi/votaciones");
      setData(result.data || []);
      setLinked(result.linked !== false);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Votar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Participa en las votaciones de SEDIPRO UNT con tu cuenta.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw /> Actualizar
        </Button>
      </div>
      {loading ? (
        <PageLoading />
      ) : error ? (
        <PageError message={error} onRetry={load} />
      ) : !linked ? (
        <Card>
          <EmptyState
            icon={Vote}
            title="Tu cuenta necesita una ficha vinculada"
            description="Administración debe vincular tu cuenta a tu registro de sediprano para que puedas votar."
          />
        </Card>
      ) : data.length === 0 ? (
        <Card>
          <EmptyState
            icon={Vote}
            title="No hay votaciones abiertas"
            description="Las votaciones aparecerán aquí cuando se habiliten."
          />
        </Card>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {data.map((vote) => (
            <VoteCard key={vote._id} vote={vote} onVoted={load} />
          ))}
        </div>
      )}
    </div>
  );
}

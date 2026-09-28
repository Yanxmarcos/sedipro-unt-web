"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordForm } from "@/components/admin/password-form";
import { usePanelSession } from "@/components/admin/panel-session";

export default function CambiarContrasenaPage() {
  const router = useRouter();
  const { user, refresh } = usePanelSession();

  return (
    <Card className="mx-auto my-6 max-w-lg">
      <CardHeader>
        <CardTitle>Cambiar contraseña</CardTitle>
        <CardDescription>
          Protege el acceso a tu cuenta de SEDIPRO UNT.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PasswordForm
          dni={user?.dni}
          requiredChange={user?.mustChangePassword}
          onSaved={async () => {
            await refresh();
            router.replace("/panel");
          }}
        />
      </CardContent>
    </Card>
  );
}

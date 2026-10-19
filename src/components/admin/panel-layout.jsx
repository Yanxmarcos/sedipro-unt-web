"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AdminProviders from "@/components/AdminProviders";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import Footer from "@/components/admin/Footer";
import { SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  PanelSessionProvider,
  usePanelSession,
} from "@/components/admin/panel-session";
import { PageError, PageLoading } from "@/components/admin/page-state";
import { canOpenPanelPage } from "@/lib/panel-permissions.mjs";

function PanelContent({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, assignments, loading, authenticated, error, refresh } =
    usePanelSession();
  const changingPassword = pathname === "/panel/cambiar-contrasena";

  useEffect(() => {
    if (loading || error) return;
    if (!authenticated) {
      router.replace("/login?redirect=" + encodeURIComponent(pathname));
    } else if (user?.mustChangePassword && !changingPassword) {
      router.replace("/panel/cambiar-contrasena");
    }
  }, [
    authenticated,
    changingPassword,
    error,
    loading,
    pathname,
    router,
    user?.mustChangePassword,
  ]);

  if (loading) return <PageLoading label="Verificando tu cuenta…" />;
  if (error)
    return (
      <div className="mx-auto max-w-xl p-6">
        <PageError message={error} onRetry={refresh} />
      </div>
    );
  if (!authenticated || (user?.mustChangePassword && !changingPassword))
    return <PageLoading />;

  const allowed = canOpenPanelPage(pathname, user, assignments);
  return (
    <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden">
      <Sidebar />
      <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <Header />
        <main className="mx-auto w-full min-w-0 max-w-360 flex-1 overflow-x-hidden px-4 py-6 sm:px-6">
          {allowed ? (
            children
          ) : (
            <div className="mx-auto max-w-xl space-y-4 py-12 text-center">
              <PageError message="Tu cuenta no tiene acceso a esta sección." />
              <Button nativeButton={false} render={<Link href="/panel" />}>
                Volver al inicio
              </Button>
            </div>
          )}
        </main>
        <Footer />
      </SidebarInset>
    </div>
  );
}

export default function PanelLayout({ children }) {
  return (
    <div className="admin-root min-h-screen bg-background text-foreground">
      <AdminProviders sidebarDefaultOpen>
        <PanelSessionProvider>
          <PanelContent>{children}</PanelContent>
          <Toaster />
        </PanelSessionProvider>
      </AdminProviders>
    </div>
  );
}

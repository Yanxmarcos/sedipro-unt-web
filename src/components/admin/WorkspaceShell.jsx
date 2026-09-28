import ModeToggle from "@/components/admin/ModeToggle";
import { Toaster } from "@/components/ui/sonner";

export default function WorkspaceShell({ children }) {
  return (
    <div className="admin-root min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-360 space-y-6 px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between border-b pb-4">
          <span className="text-sm font-semibold">SEDIPRO UNT</span>
          <ModeToggle />
        </div>
        {children}
        <Toaster />
      </div>
    </div>
  );
}

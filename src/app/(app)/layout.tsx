import { NavBar } from "@/components/layout/nav-bar";
import { AuthProvider } from "@/contexts/auth-context";
import { CommandPalette } from "@/components/global/command-palette";
import { ToastProvider } from "@/components/global/toast";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[#FAF8F4]">
          <NavBar />
          <main className="max-w-[1200px] mx-auto px-12 pb-16">
            {children}
          </main>
          <CommandPalette />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

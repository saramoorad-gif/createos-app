import { NavBar } from "@/components/layout/nav-bar";
import { AuthProvider } from "@/contexts/auth-context";
import { CommandPalette } from "@/components/global/command-palette";
import { ToastProvider } from "@/components/global/toast";
import { LoadingBar } from "@/components/global/loading-bar";
import { KeyboardShortcuts } from "@/components/global/keyboard-shortcuts";
import { SubscriptionGate } from "@/components/global/subscription-gate";
import { ErrorBoundary } from "@/components/global/error-boundary";
import { ErrorTracker } from "@/components/global/error-tracker";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorTracker />
        <div className="min-h-screen bg-[#FAF8F4]">
          <LoadingBar />
          <NavBar />
          <SubscriptionGate>
            <main className="max-w-[1200px] mx-auto px-12 pb-16">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
          </SubscriptionGate>
          <CommandPalette />
          <KeyboardShortcuts />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

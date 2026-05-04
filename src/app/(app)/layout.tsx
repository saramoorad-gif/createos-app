import { NavBar } from "@/components/layout/nav-bar";
import { CommandPalette } from "@/components/global/command-palette";
import { LoadingBar } from "@/components/global/loading-bar";
import { KeyboardShortcuts } from "@/components/global/keyboard-shortcuts";
import { SubscriptionGate } from "@/components/global/subscription-gate";
import { ErrorBoundary } from "@/components/global/error-boundary";
import { ErrorTracker } from "@/components/global/error-tracker";

// AuthProvider + ToastProvider live in the root layout (src/app/layout.tsx)
// so every route — public and authed — has access to auth state. Do NOT
// re-wrap them here, that would break React context identity.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ErrorTracker />
      <div className="min-h-screen bg-[#FAF8F4]">
        <LoadingBar />
        <NavBar />
        <SubscriptionGate>
          <main className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 pb-16">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </SubscriptionGate>
        <CommandPalette />
        <KeyboardShortcuts />
      </div>
    </>
  );
}

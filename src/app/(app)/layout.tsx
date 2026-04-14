import { NavBar } from "@/components/layout/nav-bar";
import { AuthProvider } from "@/contexts/auth-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#FAF8F4]">
        <NavBar />
        <main className="max-w-[1200px] mx-auto px-12 pb-16">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}

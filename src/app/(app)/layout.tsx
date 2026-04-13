import { NavBar } from "@/components/layout/nav-bar";
import { AuthProvider } from "@/contexts/auth-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F7F4EF]">
        <NavBar />
        <main className="max-w-[1200px] mx-auto px-6 pb-16">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}

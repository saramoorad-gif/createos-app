import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/components/global/toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[#FAF8F4]">
          {children}
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

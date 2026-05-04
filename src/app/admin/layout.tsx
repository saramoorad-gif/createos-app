// AuthProvider + ToastProvider live in the root layout (src/app/layout.tsx).
// Do NOT re-wrap them here — that would create a sibling context and break auth.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {children}
    </div>
  );
}

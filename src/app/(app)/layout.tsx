import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { QuickCapture } from "@/components/shared/quick-capture";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="sidebar-desktop">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-warm-50">
          <div className="page-enter">{children}</div>
        </main>
      </div>
      <QuickCapture />
    </div>
  );
}

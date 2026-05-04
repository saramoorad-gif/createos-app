"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  toast: (type: ToastType, message: string, action?: { label: string; onClick: () => void }) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

const icons: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const borderColors: Record<ToastType, string> = {
  success: "border-l-[#3D7A58]",
  error: "border-l-[#A03D3D]",
  info: "border-l-[#7BAFC8]",
  warning: "border-l-[#A07830]",
};

const iconColors: Record<ToastType, string> = {
  success: "text-[#3D7A58]",
  error: "text-[#A03D3D]",
  info: "text-[#7BAFC8]",
  warning: "text-[#A07830]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, action?: { label: string; onClick: () => void }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message, action }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  function dismiss(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-2 items-end">
        {toasts.map(t => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={`bg-white border border-[#D8E8EE] border-l-[3px] ${borderColors[t.type]} rounded-[10px] px-4 py-3 flex items-center gap-3 max-w-[360px]`}
              style={{
                boxShadow: "0 8px 24px rgba(30,63,82,.1)",
                animation: "toastIn 200ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <style>{`
                @keyframes toastIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
              `}</style>
              <Icon className={`h-4 w-4 flex-shrink-0 ${iconColors[t.type]}`} />
              <p className="text-[13px] font-sans text-[#1A2C38] flex-1" style={{ fontWeight: 500 }}>{t.message}</p>
              {t.action && (
                <button onClick={t.action.onClick} className="text-[12px] font-sans text-[#7BAFC8] hover:underline flex-shrink-0" style={{ fontWeight: 500 }}>
                  {t.action.label}
                </button>
              )}
              <button onClick={() => dismiss(t.id)} className="text-[#8AAABB] hover:text-[#4A6070] flex-shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

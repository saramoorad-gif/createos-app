"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { LucideIcon } from "lucide-react";

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon?: LucideIcon;
}

interface ContextMenuProps {
  children: ReactNode;
  items: ContextMenuItem[];
}

interface MenuPosition {
  x: number;
  y: number;
}

export function ContextMenu({ children, items }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const handleContextMenu = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      // Adjust position so menu stays in viewport
      const x = Math.min(e.clientX, window.innerWidth - 220);
      const y = Math.min(
        e.clientY,
        window.innerHeight - items.length * 36 - 16
      );
      setPosition({ x, y });
      setActiveIndex(-1);
      setOpen(true);
    },
    [items.length]
  );

  const handleSelect = useCallback(
    (item: ContextMenuItem) => {
      close();
      item.onClick();
    },
    [close]
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          close();
          break;
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % items.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < items.length) {
            handleSelect(items[activeIndex]);
          }
          break;
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, activeIndex, items, close, handleSelect]);

  return (
    <div onContextMenu={handleContextMenu} className="contents">
      {children}

      {open && (
        <>
          {/* Invisible overlay to capture clicks */}
          <div className="fixed inset-0 z-[110]" onClick={close} />

          {/* Menu */}
          <div
            ref={menuRef}
            className="fixed z-[111] w-[200px] bg-white border border-[#D8E8EE] rounded-[8px] py-1 overflow-hidden"
            style={{
              top: position.y,
              left: position.x,
              boxShadow: "0 8px 24px rgba(30,63,82,.12)",
              animation: "cmPopIn 150ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <style>{`
              @keyframes cmPopIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>

            {items.map((item, i) => {
              const Icon = item.icon;
              const isActive = i === activeIndex;
              return (
                <button
                  key={item.label}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-2.5 px-3 text-left transition-colors ${
                    isActive ? "bg-[#F2F8FB]" : "bg-transparent"
                  }`}
                  style={{ height: 36 }}
                >
                  {Icon && (
                    <Icon
                      className={`h-3.5 w-3.5 flex-shrink-0 ${
                        item.danger ? "text-[#A03D3D]" : "text-[#8AAABB]"
                      }`}
                    />
                  )}
                  <span
                    className={`font-sans text-[13px] ${
                      item.danger ? "text-[#A03D3D]" : "text-[#1A2C38]"
                    }`}
                    style={{ fontWeight: 400 }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

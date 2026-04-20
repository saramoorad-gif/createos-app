"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SmartCTA } from "@/components/marketing/smart-cta";

const links = [
  { name: "Home", href: "/" },
  { name: "For Creators", href: "/for-creators" },
  { name: "For Agencies", href: "/for-agencies" },
  { name: "Pricing", href: "/pricing" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-colors ${scrolled ? "border-b border-[#E3DED2]" : "border-b border-transparent"}`}
        style={{
          background: "color-mix(in oklab, #FAF8F4 88%, transparent)",
          backdropFilter: "blur(12px) saturate(1.4)",
          WebkitBackdropFilter: "blur(12px) saturate(1.4)",
        }}
      >
        <div className="max-w-[1200px] mx-auto grid grid-cols-[auto_1fr_auto] items-center px-6 h-14 gap-5">
          {/* Brand */}
          <Link href="/" className="inline-flex items-center gap-2.5 font-serif text-[19px] tracking-[-0.01em] text-[#0F1E28]">
            <span
              className="inline-block w-[22px] h-[22px] rounded-full relative"
              style={{
                background: "conic-gradient(from 210deg, #1E3F52, #7BAFC8, #F0EAE0, #1E3F52)",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)",
              }}
            >
              <span
                className="absolute rounded-full"
                style={{ inset: 5, background: "#FAF8F4" }}
              />
            </span>
            Create<em className="italic text-[#3D6E8A] -ml-0.5">Suite</em>
          </Link>

          {/* Center tabs (desktop) */}
          <nav className="hidden lg:flex items-center justify-center gap-0.5">
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.name}
                  href={l.href}
                  className={`relative px-3 py-2 text-[13px] font-sans font-medium rounded-[6px] whitespace-nowrap transition-colors ${
                    active ? "text-[#0F1E28]" : "text-[#8AAABB] hover:text-[#4A6070]"
                  }`}
                >
                  {l.name}
                  {active && (
                    <span
                      className="absolute left-3 right-3 h-[2px] bg-[#7BAFC8] rounded-full"
                      style={{ bottom: -6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="text-[12.5px] font-sans font-medium text-[#4A6070] hover:text-[#0F1E28] px-3 py-1.5"
            >
              Log in
            </Link>
            <SmartCTA
              label="Get started →"
              loggedInLabel="Dashboard →"
              className="inline-flex items-center gap-1.5 bg-[#0F1E28] text-white text-[12.5px] font-sans font-medium px-3 py-1.5 rounded-[6px] hover:bg-[#1b2f3a] transition-colors"
            />
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-[#0F1E28] justify-self-end"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-[#FAF8F4] pt-20 px-6 md:hidden">
          <nav className="space-y-4">
            {links.map((l) => (
              <Link
                key={l.name}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block text-[18px] font-serif text-[#0F1E28] py-2 border-b border-[#E3DED2]"
              >
                {l.name}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block text-center text-[15px] font-sans font-medium text-[#0F1E28] py-3 border border-[#D8E8EE] rounded-[8px]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="block text-center text-[15px] font-sans font-medium text-white bg-[#0F1E28] py-3 rounded-[8px]"
              >
                Get started →
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

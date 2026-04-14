"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { name: "For Creators", href: "/for-creators" },
  { name: "For Agencies", href: "/for-agencies" },
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Help", href: "/help" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-md" style={{ background: "rgba(250,248,244,.94)" }}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <Link href="/" className="text-[22px] font-serif italic text-[#3D6E8A]">
            Create Suite
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link key={l.name} href={l.href} className="text-[14px] font-sans font-500 text-[#4A6070] hover:text-[#1A2C38] transition-colors">
                {l.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-[14px] font-sans font-500 text-[#4A6070] hover:text-[#1A2C38] transition-colors">
              Log in
            </a>
            <a href="/signup" className="bg-[#1E3F52] text-white text-[14px] font-sans font-500 px-5 py-2.5 rounded-[10px] hover:bg-[#2a5269] transition-colors">
              Get started free
            </a>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-[#1A2C38]">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-[#FAF8F4] pt-20 px-6 md:hidden">
          <nav className="space-y-4">
            {links.map((l) => (
              <Link key={l.name} href={l.href} onClick={() => setOpen(false)} className="block text-[18px] font-sans font-500 text-[#1A2C38] py-2 border-b border-[#D8E8EE]">
                {l.name}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              <a href="/login" className="block text-center text-[16px] font-sans font-500 text-[#4A6070] py-3 border border-[#D8E8EE] rounded-[10px]">
                Log in
              </a>
              <a href="/signup" className="block text-center text-[16px] font-sans font-500 text-white bg-[#1E3F52] py-3 rounded-[10px]">
                Get started free
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

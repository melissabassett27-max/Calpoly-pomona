'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Main nav */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🐴</span>
            <div className="font-display leading-tight">
              <span className="text-lg font-bold text-[#1E5631]">Cal Poly Pomona</span>
              <span className="hidden sm:inline text-sm font-light text-[#1A1A1A] ml-2">Admissions</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#1A1A1A]">
            <Link href="/admissions" className="hover:text-[#1E5631] transition-colors">Admissions</Link>
            <Link href="/academics" className="hover:text-[#1E5631] transition-colors">Academics</Link>
            <Link href="/campus-life" className="hover:text-[#1E5631] transition-colors">Campus Life</Link>
            <Link href="/about" className="hover:text-[#1E5631] transition-colors">About</Link>
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            {session?.user ? (
              <>
                <Link href="/portal">
                  <Button variant="outline" size="sm" className="border-[#1E5631] text-[#1E5631] hover:bg-[#1E5631] hover:text-white">
                    <User className="w-4 h-4 mr-1" />
                    My Portal
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ redirectTo: '/' })}
                  className="text-muted-foreground"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="border-[#1E5631] text-[#1E5631]">Sign In</Button>
                </Link>
                <Link href="/apply">
                  <Button size="sm" className="bg-[#D4A017] text-white hover:bg-[#b8890f]">Apply Now</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-border px-4 pb-4 space-y-3">
            <Link href="/admissions" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Admissions</Link>
            <Link href="/academics" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Academics</Link>
            <Link href="/campus-life" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Campus Life</Link>
            <Link href="/about" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>About</Link>
            <hr />
            {session?.user ? (
              <>
                <Link href="/portal" className="block py-2 text-sm font-medium text-[#1E5631]" onClick={() => setMobileOpen(false)}>My Portal</Link>
                <button onClick={() => signOut({ redirectTo: '/' })} className="block py-2 text-sm font-medium text-destructive">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/apply" className="block" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-[#D4A017] text-white hover:bg-[#b8890f]">Apply Now</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}

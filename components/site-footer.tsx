'use client';

import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-[#1E5631] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐎</span>
              <span className="font-display text-lg font-bold">Cal Poly Pomona</span>
            </div>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-md bg-[#D4A017] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b8890f]"
            >
              Apply Now
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/admissions" className="hover:text-[#D4A017] transition-colors">Admissions</Link></li>
              <li><Link href="/academics" className="hover:text-[#D4A017] transition-colors">Academics</Link></li>
              <li><Link href="/campus-life" className="hover:text-[#D4A017] transition-colors">Campus Life</Link></li>
              <li><Link href="/apply" className="hover:text-[#D4A017] transition-colors">Apply</Link></li>
              <li><Link href="/login" className="hover:text-[#D4A017] transition-colors">Applicant Login</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Office of Admissions</h4>
            <p className="text-sm text-white/70 leading-relaxed mb-3">
              Mon–Fri: 8:00 AM – 5:00 PM PST
            </p>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Phone className="w-4 h-4 shrink-0" />
              <span suppressHydrationWarning>+1 916-290-8848</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/70 mt-1">
              <Mail className="w-4 h-4 shrink-0" />
              <span suppressHydrationWarning>cristinachen.cpp.edu@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/20 text-xs text-white/50 space-y-1">
          <p>© 2026 Cal Poly Pomona. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

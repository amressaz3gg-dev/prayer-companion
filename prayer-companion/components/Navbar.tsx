// components/Navbar.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <nav className="bg-[#121e42] text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
              <span className="text-xl">🕌</span>
            </div>
            <div className="leading-tight">
              <p className="text-white font-bold text-lg leading-none" style={{ fontFamily: 'Aref Ruqaa, serif' }}>
                رفيق الصلاة
              </p>
              <p className="text-white/50 text-xs">Prayer Companion</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-mosque"></i>
              الصلوات
            </Link>
            <Link
              href="/leaderboard"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-trophy"></i>
              لوحة الشرف
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-[#f97316] hover:text-[#fb923c] text-sm font-medium transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-shield-halved"></i>
                لوحة الإدارة
              </Link>
            )}
          </div>

          {/* User section */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2a5298] border border-white/30 flex items-center justify-center text-sm font-bold">
                    {session.user?.name?.charAt(0) || '؟'}
                  </div>
                  <span className="text-sm text-white/80">{session.user?.name}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm px-4 py-1.5 rounded-full transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
                  <span className="hidden md:inline">خروج</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-[#f97316] hover:bg-[#ea6c0a] text-white text-sm px-5 py-2 rounded-full transition-all font-semibold flex items-center gap-2"
              >
                <i className="fa-solid fa-right-to-bracket text-xs"></i>
                تسجيل الدخول
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden bg-white/10 p-2 rounded-lg"
            >
              <i className={`fa-solid ${menuOpen ? 'fa-x' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <Link href="/" className="text-white/80 py-2 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              <i className="fa-solid fa-mosque"></i> الصلوات
            </Link>
            <Link href="/leaderboard" className="text-white/80 py-2 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              <i className="fa-solid fa-trophy"></i> لوحة الشرف
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-[#f97316] py-2 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <i className="fa-solid fa-shield-halved"></i> لوحة الإدارة
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

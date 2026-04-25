'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Mode = 'login' | 'register';

// المكون اللي شايل كل الشغل بتاعك والـ Logic والـ JSX
function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'حدث خطأ أثناء التسجيل');
          setLoading(false);
          return;
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121e42] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <pattern id="signin-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M40 8 L46 26 L66 26 L50 37 L56 55 L40 44 L24 55 L30 37 L14 26 L34 26 Z"
                fill="white"
                opacity="0.5"
              />
              <circle cx="40" cy="40" r="35" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <circle cx="40" cy="40" r="20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#signin-pattern)" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🕌</div>
          <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Aref Ruqaa, serif' }}>
            رفيق الصلاة
          </h1>
          <p className="text-white/50 text-sm mt-1">Prayer Companion</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold transition-all
                ${mode === 'login' ? 'bg-[#121e42] text-white' : 'bg-white text-[#6b7280] hover:text-[#121e42]'}`}
            >
              <i className="fa-solid fa-right-to-bracket ml-2"></i>
              تسجيل الدخول
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold transition-all
                ${mode === 'register' ? 'bg-[#121e42] text-white' : 'bg-white text-[#6b7280] hover:text-[#121e42]'}`}
            >
              <i className="fa-solid fa-user-plus ml-2"></i>
              إنشاء حساب
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm mb-5 flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-[#121e42] text-sm font-semibold mb-1.5">
                    <i className="fa-solid fa-user ml-2 text-[#0284c7]"></i>
                    الاسم
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="أدخل اسمك"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#121e42]/20 focus:border-[#121e42] transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-[#121e42] text-sm font-semibold mb-1.5">
                  <i className="fa-solid fa-envelope ml-2 text-[#0284c7]"></i>
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#121e42]/20 focus:border-[#121e42] transition-all text-left"
                />
              </div>

              <div>
                <label className="block text-[#121e42] text-sm font-semibold mb-1.5">
                  <i className="fa-solid fa-lock ml-2 text-[#0284c7]"></i>
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#121e42]/20 focus:border-[#121e42] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#121e42] hover:bg-[#1e3464] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 active:scale-98"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    جارٍ التحقق...
                  </>
                ) : mode === 'login' ? (
                  <>
                    <i className="fa-solid fa-right-to-bracket"></i>
                    دخول
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-user-plus"></i>
                    إنشاء الحساب
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 bg-[#f8f9fa] rounded-xl p-4 text-xs text-[#6b7280]">
              <p className="font-semibold text-[#121e42] mb-2 flex items-center gap-1">
                <i className="fa-solid fa-circle-info text-[#0284c7]"></i>
                حسابات تجريبية:
              </p>
              <div className="space-y-1 font-mono dir-ltr text-left">
                <p>Admin: amr@prayercompanion.com / admin123</p>
                <p>User: ahmed@example.com / password123</p>
              </div>
            </div>

            {/* Google OAuth (if configured) */}
            <div className="mt-4">
              <div className="relative flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-100"></div>
                <span className="text-[#6b7280] text-xs">أو</span>
                <div className="flex-1 h-px bg-gray-100"></div>
              </div>
              <button
                onClick={() => signIn('google', { callbackUrl })}
                className="w-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[#1f2937] font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-3 text-sm"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                تسجيل الدخول بـ Google
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          <Link href="/" className="hover:text-white/70 transition-colors">
            <i className="fa-solid fa-arrow-right ml-1"></i>
            العودة للرئيسية
          </Link>
        </p>
      </div>
    </div>
  );
}

// المكون الأساسي اللي Next.js بيطلبه متغلف بـ Suspense
export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121e42] flex items-center justify-center text-white">جارٍ التحميل...</div>}>
      <SignInForm />
    </Suspense>
  );
}
// app/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchPrayerTimes, PRAYER_KEYS, getTodayDate } from '@/lib/prayers';
import { PrayerCard } from '@/components/PrayerCard';
import { PrayerStatus } from '@prisma/client';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const timings = await fetchPrayerTimes();
  const today = getTodayDate();

  let todayLogs: Array<{ prayerName: string; status: PrayerStatus }> = [];
  let userData = null;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, totalScore: true, currentStreak: true, name: true },
    });

    if (user) {
      userData = user;
      const logs = await prisma.prayerLog.findMany({
        where: { userId: user.id, loggedDate: today },
        select: { prayerName: true, status: true },
      });
      todayLogs = logs;
    }
  }

  const loggedPrayers = new Map(todayLogs.map((l) => [l.prayerName, l.status]));
  const prayedCount = todayLogs.filter((l) => l.status !== 'MISSED').length;

  // Get Hijri date (approximate)
  const hijriDate = getApproxHijriDate();
  const gregorianDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Hero Header */}
      <div className="bg-[#121e42] text-white relative overflow-hidden">
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <defs>
              <pattern id="hero-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path
                  d="M30 5 L35 20 L50 20 L38 29 L43 44 L30 35 L17 44 L22 29 L10 20 L25 20 Z"
                  fill="white"
                  opacity="0.5"
                />
                <circle cx="30" cy="30" r="25" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="400" height="200" fill="url(#hero-pattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-white/60 text-sm mb-1">{gregorianDate}</p>
              <h1
                className="text-4xl md:text-5xl font-bold text-white mb-2"
                style={{ fontFamily: 'Aref Ruqaa, serif' }}
              >
                {session ? `مرحباً، ${session.user?.name?.split(' ')[0]} 👋` : 'رفيق الصلاة'}
              </h1>
              <p className="text-white/70 text-base max-w-md">
                {session
                  ? `اليوم صلّيت ${prayedCount} من 5 صلوات — ${prayedCount === 5 ? 'أحسنت! أكملت صلواتك 🎉' : 'واصل واكمل يومك بخير'}`
                  : 'تتبع صلواتك اليومية، اكسب نقاط، وتنافس مع الأصدقاء'}
              </p>
            </div>

            {userData && (
              <div className="flex gap-4">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center min-w-[100px] backdrop-blur-sm">
                  <p className="text-3xl font-bold text-[#f97316]">{userData.totalScore}</p>
                  <p className="text-white/60 text-xs mt-1">إجمالي النقاط</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center min-w-[100px] backdrop-blur-sm">
                  <p className="text-3xl font-bold text-[#10b981]">{userData.currentStreak}</p>
                  <p className="text-white/60 text-xs mt-1">يوم متتالي 🔥</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center min-w-[100px] backdrop-blur-sm">
                  <p className="text-3xl font-bold text-white">{prayedCount}/5</p>
                  <p className="text-white/60 text-xs mt-1">صلوات اليوم</p>
                </div>
              </div>
            )}

            {!session && (
              <Link
                href="/auth/signin"
                className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-bold px-8 py-3 rounded-full transition-all self-start md:self-center text-base shadow-lg"
              >
                ابدأ الآن 🚀
              </Link>
            )}
          </div>

          {/* Progress bar */}
          {session && (
            <div className="mt-6 bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#10b981] to-[#0284c7] rounded-full transition-all duration-700"
                style={{ width: `${(prayedCount / 5) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Prayer Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#121e42]">صلوات اليوم</h2>
            <p className="text-[#6b7280] text-sm">{hijriDate}</p>
          </div>
          <Link
            href="/leaderboard"
            className="text-[#0284c7] hover:text-[#121e42] text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <i className="fa-solid fa-trophy"></i>
            لوحة الشرف
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {PRAYER_KEYS.map((key) => {
            const timeRaw = timings[key] || '00:00';
            const logged = loggedPrayers.has(key.toUpperCase());
            const status = loggedPrayers.get(key.toUpperCase());
            return (
              <PrayerCard
                key={key}
                prayerKey={key}
                time={timeRaw}
                isLogged={logged}
                loggedStatus={status}
              />
            );
          })}
        </div>

        {/* Guest CTA */}
        {!session && (
          <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-5xl mb-4">🕌</div>
            <h3 className="text-2xl font-bold text-[#121e42] mb-2" style={{ fontFamily: 'Aref Ruqaa, serif' }}>
              سجّل دخولك لتتبع صلواتك
            </h3>
            <p className="text-[#6b7280] mb-6 max-w-md mx-auto">
              احفظ سجل صلواتك، اكسب نقاط عند كل صلاة في وقتها، وتنافس مع الأصدقاء على لوحة الشرف.
            </p>
            <Link
              href="/auth/signin"
              className="bg-[#121e42] text-white font-bold px-8 py-3 rounded-full hover:bg-[#1e3464] transition-all inline-flex items-center gap-2"
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              تسجيل الدخول
            </Link>
          </div>
        )}
      </div>

      {/* Testimonials / Leaderboard preview section */}
      <LeaderboardPreviewSection />
    </div>
  );
}

async function LeaderboardPreviewSection() {
  const topUsers = await prisma.user.findMany({
    orderBy: { totalScore: 'desc' },
    take: 3,
    select: { id: true, name: true, totalScore: true, currentStreak: true },
  });

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <section className="bg-[#121e42] islamic-pattern py-16 px-4 mt-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h2
              className="text-3xl font-bold text-[#f97316]"
              style={{ fontFamily: 'Aref Ruqaa, serif' }}
            >
              لوحة الشرف
            </h2>
            <p className="text-white/60 mt-2 max-w-sm text-sm">
              هؤلاء هم أكثر المصلّين التزاماً — أحسن الله عملهم
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/leaderboard"
              className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-all"
            >
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </Link>
            <Link
              href="/leaderboard"
              className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-all"
            >
              <i className="fa-solid fa-arrow-left text-sm"></i>
            </Link>
          </div>
        </div>

        {/* Top 3 user cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topUsers.map((user, index) => {
            const initial = user.name?.charAt(0) || '؟';
            const initials = user.name?.split(' ').map((n) => n.charAt(0)).join('').substring(0, 2) || '؟';
            return (
              <div key={user.id} className="bg-white rounded-2xl p-6 flex flex-col items-center text-center shadow-lg">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fa-solid fa-star text-orange-400 text-lg"></i>
                  ))}
                </div>

                {/* Medal & rank */}
                <p className="text-2xl mb-2">{medals[index]}</p>

                {/* Quote */}
                <p className="text-[#1f2937] text-sm mb-4 leading-relaxed px-2">
                  {index === 0
                    ? '"الصلاة نور القلب والروح — صلِّ في وقتها دائماً"'
                    : index === 1
                    ? '"مَن حافظ على الصلاة فقد حافظ على دينه"'
                    : '"لا تؤجّل صلاتك، فالوقت لا يعود"'}
                </p>

                {/* User info */}
                <div className="flex items-center gap-2 mt-auto">
                  <div className="w-9 h-9 rounded-full bg-[#121e42] flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                  <div className="text-right">
                    <p className="text-[#0284c7] text-sm font-semibold">{user.name}</p>
                    <p className="text-[#6b7280] text-xs">{user.totalScore} نقطة</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function getApproxHijriDate(): string {
  // Simple approximation — in production use a proper library
  const now = new Date();
  const months = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
  ];
  // Very rough approximation based on Gregorian->Hijri offset
  const jd = Math.floor((now.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return `${day} ${months[month - 1]} ${year} هـ`;
}

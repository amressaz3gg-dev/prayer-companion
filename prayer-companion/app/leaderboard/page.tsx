// app/leaderboard/page.tsx
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  const currentUserEmail = session?.user?.email;

  const users = await prisma.user.findMany({
    orderBy: { totalScore: 'desc' },
    take: 20,
    select: {
      id: true,
      name: true,
      email: true,
      totalScore: true,
      currentStreak: true,
    },
  });

  const medals = ['🥇', '🥈', '🥉'];
  const rankColors = ['from-yellow-400/20 to-yellow-600/10', 'from-gray-300/20 to-gray-400/10', 'from-orange-300/20 to-orange-500/10'];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-[#121e42] text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <defs>
              <pattern id="lb-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 5 L35 20 L50 20 L38 29 L43 44 L30 35 L17 44 L22 29 L10 20 L25 20 Z" fill="white" opacity="0.4" />
                <circle cx="30" cy="30" r="22" fill="none" stroke="white" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="200" fill="url(#lb-pattern)" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-[#f97316]" style={{ fontFamily: 'Aref Ruqaa, serif' }}>
            لوحة الشرف
          </h1>
          <p className="text-white/60 mt-2 text-sm max-w-md mx-auto">
            أكثر المصلّين التزاماً وتقدماً — أحسن الله عملهم
          </p>
          <p className="text-white/40 text-xs mt-1">تُحدَّث تلقائياً عند كل تسجيل صلاة</p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {users.length >= 3 && (
        <section className="bg-[#121e42] islamic-pattern pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {users.slice(0, 3).map((user, i) => {
                const initials = user.name?.split(' ').map((n) => n.charAt(0)).join('').substring(0, 2) || '؟';
                const isMe = user.email === currentUserEmail;
                return (
                  <div
                    key={user.id}
                    className={`bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center text-center relative
                      ${i === 0 ? 'md:-mt-4 ring-2 ring-yellow-400/60' : ''}
                      ${isMe ? 'ring-2 ring-[#2a5298]' : ''}
                    `}
                  >
                    {isMe && (
                      <div className="absolute top-3 left-3 bg-[#0284c7] text-white text-xs px-2 py-0.5 rounded-full">
                        أنت
                      </div>
                    )}
                    {/* Stars */}
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, si) => (
                        <i key={si} className="fa-solid fa-star text-orange-400"></i>
                      ))}
                    </div>

                    {/* Rank */}
                    <div className="text-3xl mb-2">{medals[i]}</div>

                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-[#121e42] flex items-center justify-center text-white text-lg font-bold mb-3 border-4 border-white shadow-md">
                      {initials}
                    </div>

                    {/* Name & score */}
                    <h3 className="text-[#121e42] font-bold text-lg">{user.name}</h3>
                    <p className="text-[#0284c7] text-sm font-medium">{user.totalScore} نقطة</p>

                    {/* Streak */}
                    <div className="mt-3 bg-[#f8f9fa] rounded-full px-4 py-1 text-sm text-[#6b7280] flex items-center gap-1">
                      <i className="fa-solid fa-fire text-[#f97316] text-xs"></i>
                      {user.currentStreak} يوم متتالي
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Full ranking table */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-[#121e42] mb-6 flex items-center gap-2">
          <i className="fa-solid fa-list-ol text-[#0284c7]"></i>
          الترتيب الكامل
        </h2>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center py-16 text-[#6b7280]">
              <div className="text-4xl mb-4">📭</div>
              <p>لا يوجد مستخدمون بعد</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map((user, index) => {
                const isMe = user.email === currentUserEmail;
                const initials = user.name?.split(' ').map((n) => n.charAt(0)).join('').substring(0, 2) || '؟';
                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors
                      ${isMe ? 'bg-[#e0f2fe] border-r-4 border-[#0284c7]' : 'hover:bg-gray-50'}
                    `}
                  >
                    {/* Rank */}
                    <div className="w-10 text-center">
                      {index < 3 ? (
                        <span className="text-xl">{medals[index]}</span>
                      ) : (
                        <span className="text-[#6b7280] font-bold text-sm">{index + 1}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: getAvatarColor(index) }}
                    >
                      {initials}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#121e42] truncate">{user.name}</p>
                        {isMe && (
                          <span className="bg-[#0284c7] text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                            أنت
                          </span>
                        )}
                      </div>
                      <p className="text-[#6b7280] text-xs flex items-center gap-1 mt-0.5">
                        <i className="fa-solid fa-fire text-[#f97316] text-xs"></i>
                        {user.currentStreak} يوم متتالي
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-left">
                      <p className="font-bold text-[#121e42] text-lg">{user.totalScore}</p>
                      <p className="text-[#6b7280] text-xs text-left">نقطة</p>
                    </div>

                    {/* Stars (visual score indicator) */}
                    <div className="hidden sm:flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fa-solid fa-star text-xs ${
                            i < Math.min(5, Math.ceil(user.totalScore / 100))
                              ? 'text-orange-400'
                              : 'text-gray-200'
                          }`}
                        ></i>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Point system explanation */}
        <div className="mt-8 bg-[#121e42] text-white rounded-2xl p-6">
          <h3 className="text-[#f97316] font-bold text-lg mb-4" style={{ fontFamily: 'Aref Ruqaa, serif' }}>
            نظام النقاط
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'أول الوقت', pts: 10, icon: 'fa-star', color: 'text-[#10b981]' },
              { label: 'منتصف الوقت', pts: 7, icon: 'fa-clock', color: 'text-[#0284c7]' },
              { label: 'متأخر', pts: 3, icon: 'fa-hourglass-end', color: 'text-[#f97316]' },
              { label: 'فاتت', pts: 0, icon: 'fa-xmark', color: 'text-[#ef4444]' },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <i className={`fa-solid ${item.icon} ${item.color} text-xl mb-2 block`}></i>
                <p className="text-white font-bold text-lg">{item.pts}</p>
                <p className="text-white/60 text-xs">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getAvatarColor(index: number): string {
  const colors = ['#121e42', '#2a5298', '#7c3aed', '#10b981', '#0284c7', '#f97316', '#ef4444'];
  return colors[index % colors.length];
}

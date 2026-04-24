// app/admin/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllUsersForAdmin } from '@/app/actions/prayerActions';
import { PrayerStatus } from '@prisma/client';

const PRAYER_NAMES_AR: Record<string, string> = {
  FAJR: 'الفجر',
  DHUHR: 'الظهر',
  ASR: 'العصر',
  MAGHRIB: 'المغرب',
  ISHA: 'العشاء',
};

const STATUS_AR: Record<PrayerStatus, string> = {
  EARLY: 'أول الوقت',
  MID: 'منتصف',
  LATE: 'متأخر',
  MISSED: 'فاتت',
};

const STATUS_COLOR: Record<PrayerStatus, string> = {
  EARLY: 'bg-green-100 text-green-700',
  MID: 'bg-blue-100 text-blue-700',
  LATE: 'bg-orange-100 text-orange-700',
  MISSED: 'bg-red-100 text-red-700',
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // Check if user is logged in
  if (!session?.user?.email) redirect('/auth/signin');

  // Check if user is admin
  const role = (session.user as any).role;
  if (role !== 'ADMIN') redirect('/');

  const users = await getAllUsersForAdmin();

  if (!users) redirect('/');

  const totalUsers = users.length;
  const totalScore = users.reduce((acc, u) => acc + u.totalScore, 0);
  const prayersToday = users.reduce((acc, u) => acc + u.prayerLogs.length, 0);
  const activePrayersToday = users.reduce(
    (acc, u) => acc + u.prayerLogs.filter((l) => l.status !== 'MISSED').length,
    0
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Admin header */}
      <div className="bg-[#121e42] text-white py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <defs>
              <pattern id="admin-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M25 3 L29 15 L42 15 L32 23 L36 35 L25 28 L14 35 L18 23 L8 15 L21 15 Z" fill="white" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="400" height="200" fill="url(#admin-pattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#f97316]/20 border border-[#f97316]/40 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-[#f97316]"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Aref Ruqaa, serif' }}>
                لوحة الإدارة
              </h1>
              <p className="text-white/50 text-sm">مرحباً عمرو — رؤية شاملة لنشاط المستخدمين</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'إجمالي المستخدمين', value: totalUsers, icon: 'fa-users', color: 'text-[#0284c7]' },
            { label: 'إجمالي النقاط', value: totalScore.toLocaleString('ar-EG'), icon: 'fa-star', color: 'text-[#f97316]' },
            { label: 'صلوات اليوم', value: prayersToday, icon: 'fa-mosque', color: 'text-[#10b981]' },
            { label: 'صلوات مؤداة', value: activePrayersToday, icon: 'fa-circle-check', color: 'text-[#7c3aed]' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`${stat.color} text-2xl`}>
                  <i className={`fa-solid ${stat.icon}`}></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#121e42]">{stat.value}</p>
                  <p className="text-[#6b7280] text-xs">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[#121e42] font-bold text-lg flex items-center gap-2">
              <i className="fa-solid fa-table-list text-[#0284c7]"></i>
              جميع المستخدمين
            </h2>
            <span className="bg-[#f0f7ff] text-[#0284c7] text-xs font-semibold px-3 py-1 rounded-full">
              {totalUsers} مستخدم
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-[#f8f9fa] text-[#6b7280] text-xs">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">المستخدم</th>
                  <th className="px-4 py-3 font-semibold">البريد الإلكتروني</th>
                  <th className="px-4 py-3 font-semibold">الصلح</th>
                  <th className="px-4 py-3 font-semibold">النقاط</th>
                  <th className="px-4 py-3 font-semibold">الأيام المتتالية</th>
                  <th className="px-4 py-3 font-semibold">الدور</th>
                  <th className="px-4 py-3 font-semibold">صلوات اليوم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user, index) => {
                  const initials = user.name?.split(' ').map((n) => n.charAt(0)).join('').substring(0, 2) || '؟';
                  const todayPrayers = ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA'].map((p) => {
                    const log = user.prayerLogs.find((l) => l.prayerName === p);
                    return { prayer: p, log };
                  });

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-[#6b7280] text-sm">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#121e42] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                          <span className="font-semibold text-[#121e42] text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#6b7280] text-sm dir-ltr text-left">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold
                            ${user.prayerLogs.filter((l) => l.status !== 'MISSED').length >= 5
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                          {user.prayerLogs.filter((l) => l.status !== 'MISSED').length}/5
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#121e42]">{user.totalScore}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-sm">
                          <i className="fa-solid fa-fire text-[#f97316] text-xs"></i>
                          {user.currentStreak}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold
                            ${user.role === 'ADMIN' ? 'bg-[#f97316]/20 text-[#f97316]' : 'bg-gray-100 text-gray-600'}
                          `}
                        >
                          {user.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {todayPrayers.map(({ prayer, log }) => (
                            <span
                              key={prayer}
                              title={`${PRAYER_NAMES_AR[prayer]}: ${log ? STATUS_AR[log.status as PrayerStatus] : 'لم يسجّل'}`}
                              className={`text-xs px-2 py-0.5 rounded-full font-semibold
                                ${log ? STATUS_COLOR[log.status as PrayerStatus] : 'bg-gray-100 text-gray-400'}
                              `}
                            >
                              {PRAYER_NAMES_AR[prayer]}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick stats per prayer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          {['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA'].map((prayer) => {
            const allLogs = users.flatMap((u) => u.prayerLogs.filter((l) => l.prayerName === prayer));
            const prayed = allLogs.filter((l) => l.status !== 'MISSED').length;
            const missed = allLogs.filter((l) => l.status === 'MISSED').length;
            const notLogged = totalUsers - allLogs.length;
            const percentage = totalUsers > 0 ? Math.round((prayed / totalUsers) * 100) : 0;

            return (
              <div key={prayer} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#121e42] text-sm mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-mosque text-[#0284c7] text-xs"></i>
                  {PRAYER_NAMES_AR[prayer]}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#10b981]">صلّوا</span>
                    <span className="font-bold text-[#121e42]">{prayed}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#ef4444]">فاتتهم</span>
                    <span className="font-bold text-[#121e42]">{missed}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6b7280]">لم يسجّلوا</span>
                    <span className="font-bold text-[#121e42]">{notLogged}</span>
                  </div>
                  <div className="mt-2 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-[#10b981] rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-[#6b7280]">{percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

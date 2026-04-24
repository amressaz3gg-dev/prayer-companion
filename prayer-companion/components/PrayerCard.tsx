// components/PrayerCard.tsx
'use client';

import { useState, useTransition } from 'react';
import { logPrayer } from '@/app/actions/prayerActions';
import { PrayerName, PrayerStatus } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatTime, getPrayerStatus, PRAYER_META } from '@/lib/prayers';

interface PrayerCardProps {
  prayerKey: string;
  time: string;
  isLogged: boolean;
  loggedStatus?: PrayerStatus;
}

const STATUS_OPTIONS: { key: PrayerStatus; label: string; points: number; color: string; icon: string }[] = [
  { key: 'EARLY', label: 'أول الوقت', points: 10, color: 'bg-[#10b981] hover:bg-[#059669]', icon: 'fa-star' },
  { key: 'MID', label: 'منتصف الوقت', points: 7, color: 'bg-[#0284c7] hover:bg-[#0369a1]', icon: 'fa-clock' },
  { key: 'LATE', label: 'متأخر', points: 3, color: 'bg-[#f97316] hover:bg-[#ea580c]', icon: 'fa-hourglass-end' },
  { key: 'MISSED', label: 'فاتت', points: 0, color: 'bg-[#ef4444] hover:bg-[#dc2626]', icon: 'fa-xmark' },
];

const MISSED_VERSE =
  'فَخَلَفَ مِن بَعْدِهِمْ خَلْفٌ أَضَاعُوا الصَّلَاةَ وَاتَّبَعُوا الشَّهَوَاتِ ۖ فَسَوْفَ يَلْقَوْنَ غَيًّا';

const STATUS_LABEL_AR: Record<PrayerStatus, string> = {
  EARLY: 'أول الوقت',
  MID: 'منتصف الوقت',
  LATE: 'متأخر',
  MISSED: 'فاتت',
};

const STATUS_COLOR: Record<PrayerStatus, string> = {
  EARLY: '#10b981',
  MID: '#0284c7',
  LATE: '#f97316',
  MISSED: '#ef4444',
};

export function PrayerCard({ prayerKey, time, isLogged, loggedStatus }: PrayerCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'verse' } | null>(null);
  const [localLogged, setLocalLogged] = useState(isLogged);
  const [localStatus, setLocalStatus] = useState<PrayerStatus | undefined>(loggedStatus);

  const meta = PRAYER_META[prayerKey];
  const prayerStatus = getPrayerStatus(time);
  const prayerNameEnum = prayerKey.toUpperCase() as PrayerName;

  const handleLog = (status: PrayerStatus) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    startTransition(async () => {
      const result = await logPrayer(prayerNameEnum, status);

      if (result?.error) {
        setToast({ msg: result.error, type: 'error' });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      if (status === 'MISSED') {
        setToast({ msg: MISSED_VERSE, type: 'verse' });
        setTimeout(() => setToast(null), 6000);
      } else {
        setToast({ msg: `تم التسجيل! حصلت على ${result?.earnedPoints} نقطة 🎉`, type: 'success' });
        setTimeout(() => setToast(null), 3000);
      }

      setLocalLogged(true);
      setLocalStatus(status);
      setFlipped(false);
    });
  };

  return (
    <div className="relative prayer-card">
      {/* Toast */}
      {toast && (
        <div
          className={`toast absolute -top-16 right-0 left-0 z-50 mx-2 rounded-xl p-3 text-sm text-center shadow-lg
            ${toast.type === 'success' ? 'bg-[#10b981] text-white' : ''}
            ${toast.type === 'error' ? 'bg-[#ef4444] text-white' : ''}
            ${toast.type === 'verse' ? 'bg-[#121e42] text-white border border-[#f97316]/40' : ''}
          `}
        >
          {toast.type === 'verse' && (
            <p className="text-[#f97316] text-xs mb-1" style={{ fontFamily: 'Aref Ruqaa, serif' }}>
              قال الله تعالى:
            </p>
          )}
          <p className={toast.type === 'verse' ? 'font-ruqaa text-base leading-relaxed' : 'font-semibold'}>
            {toast.msg}
          </p>
        </div>
      )}

      {/* Card */}
      <div
        className={`rounded-2xl overflow-hidden shadow-md border border-white/50 ${
          prayerStatus === 'active' && !localLogged ? 'active-prayer ring-2 ring-[#2a5298]/40' : ''
        }`}
        style={{ minHeight: '340px' }}
      >
        {/* TOP HALF — gradient image area */}
        <div className={`relative bg-gradient-to-br ${meta.gradient} h-44 flex flex-col items-center justify-center`}>
          {/* Badge top-right */}
          <div className={`absolute top-4 left-4 ${meta.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow`}>
            فريضة
          </div>

          {/* Status indicator top-left */}
          <div className="absolute top-4 right-4">
            {localLogged ? (
              <span className="bg-[#10b981]/90 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <i className="fa-solid fa-circle-check text-xs"></i>
                مسجّلة
              </span>
            ) : prayerStatus === 'active' ? (
              <span className="bg-[#f97316]/90 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <i className="fa-solid fa-circle text-xs"></i>
                الآن
              </span>
            ) : prayerStatus === 'passed' ? (
              <span className="bg-white/20 text-white/80 text-xs px-3 py-1 rounded-full">مضت</span>
            ) : (
              <span className="bg-white/20 text-white/80 text-xs px-3 py-1 rounded-full">قادمة</span>
            )}
          </div>

          {/* Decorative Islamic geometric pattern (subtle) */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <pattern id={`star-${prayerKey}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 5 L23 15 L34 15 L25 21 L28 32 L20 26 L12 32 L15 21 L6 15 L17 15 Z" fill="white" opacity="0.4" />
              </pattern>
              <rect width="200" height="200" fill={`url(#star-${prayerKey})`} />
            </svg>
          </div>

          {/* Prayer name */}
          <p className="text-white/60 text-sm mb-1">{meta.icon}</p>
          <h3
            className="text-white text-3xl font-bold text-center relative z-10"
            style={{ fontFamily: 'Aref Ruqaa, serif' }}
          >
            {meta.arabicName}
          </h3>
        </div>

        {/* BOTTOM HALF — content area */}
        <div className="bg-white px-5 py-4 flex flex-col gap-3">
          {!flipped ? (
            <>
              {/* Stats row */}
              <div className="flex items-center gap-4 text-[#0284c7] text-sm">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-star text-xs"></i>
                  {localLogged && localStatus ? STATUS_LABEL_AR[localStatus] : 'بانتظارك'}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-regular fa-clock text-xs"></i>
                  {formatTime(time)}
                </span>
              </div>

              {/* Title + description */}
              <div>
                <h4 className="text-[#121e42] font-bold text-lg leading-tight">{meta.arabicName}</h4>
                <p className="text-[#6b7280] text-sm mt-0.5 leading-relaxed">
                  {localLogged && localStatus
                    ? `تم التسجيل بحالة: ${STATUS_LABEL_AR[localStatus]}`
                    : prayerStatus === 'active'
                    ? 'وقت الصلاة الآن! لا تضيّعها 🤲'
                    : prayerStatus === 'passed'
                    ? 'انتهى وقت الصلاة — سجّل حالتك'
                    : `موعدها الساعة ${formatTime(time)}`}
                </p>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => (session ? setFlipped(true) : router.push('/auth/signin'))}
                  disabled={localLogged}
                  className={`flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full transition-all
                    ${localLogged
                      ? 'bg-[#10b981] text-white cursor-default'
                      : 'bg-[#121e42] text-white hover:bg-[#1e3464] active:scale-95'}
                  `}
                >
                  {localLogged ? (
                    <>
                      <i className="fa-solid fa-circle-check text-xs"></i>
                      تم التسجيل
                    </>
                  ) : (
                    <>
                      تسجيل
                      <i className="fa-solid fa-share text-xs"></i>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <button className="text-[#121e42] hover:text-[#f97316] transition-colors">
                    <i className="fa-regular fa-heart text-lg"></i>
                  </button>
                  <button className="text-[#121e42] hover:text-[#2a5298] transition-colors">
                    <i className="fa-regular fa-bookmark text-lg"></i>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Flipped side — prayer status selection */
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[#121e42] font-bold text-sm">كيف صلّيت؟</p>
                <button
                  onClick={() => setFlipped(false)}
                  className="text-[#6b7280] hover:text-[#121e42] text-xs flex items-center gap-1"
                >
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                  رجوع
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleLog(opt.key)}
                    disabled={isPending}
                    className={`${opt.color} text-white rounded-xl py-3 px-2 text-sm font-semibold flex flex-col items-center gap-1 transition-all active:scale-95 disabled:opacity-60`}
                  >
                    <i className={`fa-solid ${opt.icon} text-base`}></i>
                    <span>{opt.label}</span>
                    <span className="text-xs opacity-80">+{opt.points} نقطة</span>
                  </button>
                ))}
              </div>

              {isPending && (
                <div className="text-center text-sm text-[#6b7280] py-1">
                  <i className="fa-solid fa-spinner fa-spin me-2"></i>
                  جارٍ الحفظ...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

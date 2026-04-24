// lib/prayers.ts

export interface PrayerTime {
  name: string;
  arabicName: string;
  englishKey: string;
  time: string;
  gradient: string;
  badge: string;
  badgeColor: string;
  icon: string;
}

export const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const PRAYER_META: Record<
  string,
  { arabicName: string; gradient: string; badgeColor: string; icon: string }
> = {
  Fajr: {
    arabicName: 'صلاة الفجر',
    gradient: 'from-[#0f0c29] via-[#302b63] to-[#24243e]',
    badgeColor: 'bg-[#7c3aed]',
    icon: '🌙',
  },
  Dhuhr: {
    arabicName: 'صلاة الظهر',
    gradient: 'from-[#1e3c72] via-[#2a5298] to-[#1e3c72]',
    badgeColor: 'bg-[#10b981]',
    icon: '☀️',
  },
  Asr: {
    arabicName: 'صلاة العصر',
    gradient: 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
    badgeColor: 'bg-[#10b981]',
    icon: '🌤️',
  },
  Maghrib: {
    arabicName: 'صلاة المغرب',
    gradient: 'from-[#373b44] via-[#1e3c72] to-[#4286f4]',
    badgeColor: 'bg-[#7c3aed]',
    icon: '🌅',
  },
  Isha: {
    arabicName: 'صلاة العشاء',
    gradient: 'from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]',
    badgeColor: 'bg-[#7c3aed]',
    icon: '🌃',
  },
};

export async function fetchPrayerTimes(
  city = 'Damietta',
  country = 'Egypt',
  method = 5
): Promise<Record<string, string>> {
  try {
    const today = new Date();
    const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity/${date}?city=${city}&country=${country}&method=${method}`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    if (data.code === 200) {
      return data.data.timings;
    }
  } catch (err) {
    console.error('Failed to fetch prayer times:', err);
  }
  // Fallback times
  return {
    Fajr: '04:30',
    Dhuhr: '12:10',
    Asr: '15:30',
    Maghrib: '18:05',
    Isha: '19:35',
  };
}

export function formatTime(time24: string): string {
  const [hourStr, minStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const min = minStr;
  const period = hour >= 12 ? 'م' : 'ص';
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${hour12}:${min} ${period}`;
}

export function getPrayerStatus(time24: string): 'waiting' | 'active' | 'passed' {
  const now = new Date();
  const [hour, min] = time24.split(':').map(Number);
  const prayerMinutes = hour * 60 + min;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (nowMinutes < prayerMinutes - 30) return 'waiting';
  if (nowMinutes <= prayerMinutes + 120) return 'active';
  return 'passed';
}

export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

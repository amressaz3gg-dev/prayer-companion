// app/actions/prayerActions.ts
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTodayDate } from '@/lib/prayers';
import { PrayerName, PrayerStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const POINTS_MAP: Record<PrayerStatus, number> = {
  EARLY: 10,
  MID: 7,
  LATE: 3,
  MISSED: 0,
};

export async function logPrayer(prayerName: PrayerName, status: PrayerStatus) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: 'يجب تسجيل الدخول أولاً' };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return { error: 'المستخدم غير موجود' };

  const today = getTodayDate();
  const earnedPoints = POINTS_MAP[status];

  try {
    const existing = await prisma.prayerLog.findUnique({
      where: {
        userId_prayerName_loggedDate: {
          userId: user.id,
          prayerName,
          loggedDate: today,
        },
      },
    });

    if (existing) {
      return { error: 'تم تسجيل هذه الصلاة مسبقاً اليوم' };
    }

    await prisma.prayerLog.create({
      data: {
        userId: user.id,
        prayerName,
        status,
        earnedPoints,
        loggedDate: today,
      },
    });

    // Update user total score
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalScore: { increment: earnedPoints },
      },
    });

    // Update streak
    await updateStreak(user.id, today);

    revalidatePath('/');
    revalidatePath('/leaderboard');

    return { success: true, earnedPoints };
  } catch (err: any) {
    if (err.code === 'P2002') {
      return { error: 'تم تسجيل هذه الصلاة مسبقاً اليوم' };
    }
    console.error(err);
    return { error: 'حدث خطأ أثناء التسجيل' };
  }
}

async function updateStreak(userId: string, today: string) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const yesterdayLogs = await prisma.prayerLog.findMany({
    where: { userId, loggedDate: yesterdayStr },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  if (yesterdayLogs.length === 5) {
    await prisma.user.update({
      where: { id: userId },
      data: { currentStreak: { increment: 1 } },
    });
  } else {
    // Check if today is the first prayer today
    const todayLogs = await prisma.prayerLog.count({
      where: { userId, loggedDate: today },
    });
    if (todayLogs === 1) {
      await prisma.user.update({
        where: { id: userId },
        data: { currentStreak: 1 },
      });
    }
  }
}

export async function getTodayLogs() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return [];

  const today = getTodayDate();
  return prisma.prayerLog.findMany({
    where: { userId: user.id, loggedDate: today },
  });
}

export async function getLeaderboard() {
  return prisma.user.findMany({
    orderBy: { totalScore: 'desc' },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      totalScore: true,
      currentStreak: true,
    },
  });
}

export async function getAllUsersForAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || user.role !== 'ADMIN') return null;

  const today = getTodayDate();

  return prisma.user.findMany({
    orderBy: { totalScore: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      totalScore: true,
      currentStreak: true,
      createdAt: true,
      prayerLogs: {
        where: { loggedDate: today },
        select: {
          prayerName: true,
          status: true,
          earnedPoints: true,
        },
      },
    },
  });
}

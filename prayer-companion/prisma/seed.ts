// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user (Amr)
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  await prisma.user.upsert({
    where: { email: 'amr@prayercompanion.com' },
    update: {},
    create: {
      name: 'عمرو',
      email: 'amr@prayercompanion.com',
      password: hashedPassword,
      role: Role.ADMIN,
      totalScore: 500,
      currentStreak: 15,
    },
  });

  // Create sample users
  const users = [
    { name: 'أحمد محمد', email: 'ahmed@example.com', score: 420, streak: 12 },
    { name: 'فاطمة علي', email: 'fatima@example.com', score: 385, streak: 10 },
    { name: 'محمد إبراهيم', email: 'ibrahim@example.com', score: 310, streak: 8 },
    { name: 'زينب حسن', email: 'zainab@example.com', score: 275, streak: 6 },
    { name: 'عبدالله كريم', email: 'abdullah@example.com', score: 230, streak: 5 },
  ];

  for (const user of users) {
    const pw = await bcrypt.hash('password123', 12);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: pw,
        role: Role.USER,
        totalScore: user.score,
        currentStreak: user.streak,
      },
    });
  }

  console.log('✅ Database seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

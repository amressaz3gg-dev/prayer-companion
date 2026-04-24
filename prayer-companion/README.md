# 🕌 رفيق الصلاة — Prayer Companion

A production-ready full-stack Islamic prayer tracking app built with Next.js 15, Prisma, NextAuth.js, and Tailwind CSS.

## ✨ Features

- **5 Daily Prayers** with real-time prayer times from Aladhan API (Damietta, Egypt)
- **Prayer Logging** with 4 status options (Early/Mid/Late/Missed) and point rewards
- **Gamification** — earn points and compete on the leaderboard
- **Streak tracking** — consecutive days of prayer
- **Authentication** — Email/Password + Google OAuth
- **Role-based access** — Admin (Amr) and regular users
- **Admin Panel** — full user stats and today's prayer logs
- **Beautiful RTL Arabic UI** — Cairo & Aref Ruqaa fonts, Deep Navy + Orange design system
- **Islamic geometric patterns** as decorative backgrounds

## 🚀 Quick Start

### 1. Clone and install

```bash
cd prayer-companion
npm install
```

### 2. Environment setup

```bash
cp .env.example .env
```

Edit `.env` and set:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Run: openssl rand -base64 32

# Optional Google OAuth:
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database setup

```bash
npm run db:push     # Create tables
npm run db:seed     # Seed with demo users
```

### 4. Run development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 👤 Demo Accounts

| Role  | Email                        | Password    |
|-------|------------------------------|-------------|
| Admin | amr@prayercompanion.com      | admin123    |
| User  | ahmed@example.com            | password123 |
| User  | fatima@example.com           | password123 |

## 🏗️ Tech Stack

| Technology    | Purpose                          |
|---------------|----------------------------------|
| Next.js 15    | Full-stack framework (App Router)|
| TypeScript    | Type safety                      |
| Tailwind CSS  | Styling                          |
| Prisma + SQLite | Database ORM                  |
| NextAuth.js   | Authentication                   |
| Aladhan API   | Real prayer times                |
| Cairo font    | Arabic UI typography             |
| Aref Ruqaa    | Artistic Arabic headings         |
| Font Awesome  | Icons                            |

## 📁 Project Structure

```
prayer-companion/
├── app/
│   ├── actions/
│   │   └── prayerActions.ts    # Server actions
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth route
│   │   └── register/           # User registration
│   ├── auth/signin/            # Custom sign-in page
│   ├── leaderboard/            # Rankings page
│   ├── admin/                  # Admin panel (Amr only)
│   ├── layout.tsx              # Root layout with fonts
│   ├── page.tsx                # Dashboard (main page)
│   ├── globals.css             # Global styles + animations
│   └── providers.tsx           # SessionProvider wrapper
├── components/
│   ├── Navbar.tsx              # Navigation with auth
│   └── PrayerCard.tsx          # Prayer card with flip animation
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── prayers.ts              # Prayer times utilities
│   └── prisma.ts               # Prisma client singleton
└── prisma/
    ├── schema.prisma           # Database schema
    └── seed.ts                 # Demo data seeder
```

## 🎨 Design System

- **Primary**: `#121e42` (Deep Navy Blue)
- **Accent**: `#f97316` (Orange)
- **Success**: `#10b981` (Emerald)
- **Info**: `#0284c7` (Sky Blue)
- **Purple**: `#7c3aed` (Prayer badges)
- **Background**: `#f8f9fa` (Off-white)

## 🔑 Points System

| Status        | Points |
|---------------|--------|
| أول الوقت (Early) | +10 |
| منتصف الوقت (Mid) | +7  |
| متأخر (Late)      | +3  |
| فاتت (Missed)     | 0   |

When a prayer is marked as Missed, a Quranic verse reminder is shown:
> فَخَلَفَ مِن بَعْدِهِمْ خَلْفٌ أَضَاعُوا الصَّلَاةَ...

## 🔒 Admin Access

The admin panel at `/admin` is secured server-side. Only users with `role: ADMIN` in the database can access it. The admin is seeded as **عمرو** (Amr).

## 📱 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Change `DATABASE_URL` to a PostgreSQL URL (PlanetScale, Neon, Supabase)
5. Update `schema.prisma` provider to `postgresql`

### Docker
```bash
docker build -t prayer-companion .
docker run -p 3000:3000 prayer-companion
```

#!/bin/bash

echo "🚀 [SPRINT 1] Memulai Bootstrapping Infrastruktur Dasar kerjaKU.click..."
echo "======================================================================="

# 1. MEMBANGUN STRUKTUR FOLDER DOMAIN-DRIVEN
echo "📁 1. Membangun Struktur Folder Modular Monolith..."

# Folder App Router (Routing UI)
mkdir -p app/\(auth\)/login app/\(auth\)/register app/\(public\) app/api
mkdir -p app/app/customer app/app/ksatria app/app/admin app/app/system

# Folder Features (Domain Logic)
for domain in auth customer ksatria product order finance cms; do
  mkdir -p features/$domain/{components,services,schemas,types}
done

# Folder Infrastruktur & Shared
mkdir -p components/{ui,layouts,shared}
mkdir -p lib/{supabase,react-query}
mkdir -p hooks schemas types constants store providers public supabase

# 2. GENERATE: app/layout.tsx (Root Layout & Font Setup)
echo "📄 2. Membuat Root Layout (app/layout.tsx)..."
cat << 'EOF' > app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "kerjaKU.click - Urusan Rumah Jadi Mudah",
  description: "Platform layanan jasa rumah tangga profesional di Kota Palu.",
  manifest: "/manifest.ts",
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${plusJakarta.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        {/* Global Providers akan disuntikkan di sini pada Sprint 4 */}
        {children}
      </body>
    </html>
  );
}
EOF

# 3. GENERATE: app/manifest.ts (PWA Configuration)
echo "📱 3. Membuat PWA Manifest (app/manifest.ts)..."
cat << 'EOF' > app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'kerjaKU Ksatria & Klien',
    short_name: 'kerjaKU',
    description: 'Aplikasi operasional jasa rumah tangga kerjaKU.click',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#2563EB',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
EOF

# 4. GENERATE: middleware.ts (Auth & Role Guard Foundation)
echo "🛡️ 4. Membuat Middleware RBAC (middleware.ts)..."
cat << 'EOF' > middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati asset publik dan API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // TODO (Sprint 2): Integrasi Supabase Server Client untuk baca session
  // Const session = await getSupabaseSession();
  const isAuthenticated = false; // Mock data
  const userRole = 'guest'; // Mock role (customer, ksatria, admin)

  // Proteksi Route /app/* (Dashboard)
  if (pathname.startsWith('/app/')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role Guarding (Mencegah lintas akses)
    if (pathname.startsWith('/app/customer') && userRole !== 'customer') {
      return NextResponse.redirect(new URL('/app/ksatria', request.url)); // Sederhanakan redirect fallback
    }
    if (pathname.startsWith('/app/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/app/ksatria', request.url));
    }
  }

  // Mencegah user login mengakses halaman login/register
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL(`/app/${userRole}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
EOF

# 5. GENERATE: .env.local (Environment Skeleton)
echo "🔐 5. Membuat Template Environment Variables..."
cat << 'EOF' > .env.local
# APP CONFIG
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# THIRD PARTY
FONNTE_API_TOKEN=
WA_ADMIN_NUMBER=
EOF

echo "======================================================================="
echo "✅ SPRINT 1 SELESAI: Infrastruktur Dasar berhasil di-generate!"
echo "Langkah selanjutnya: Install dependencies Shadcn UI dan Zustand."
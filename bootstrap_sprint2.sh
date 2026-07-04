#!/bin/bash

echo "🚀 [SPRINT 2] Memulai Integrasi Supabase SSR & Keamanan..."
echo "======================================================================="

mkdir -p lib/supabase

# 1. GENERATE: Supabase Browser Client
echo "📄 1. Membuat Browser Client (lib/supabase/client.ts)..."
cat << 'EOF' > lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
EOF

# 2. GENERATE: Supabase Server Client
echo "📄 2. Membuat Server Client (lib/supabase/server.ts)..."
cat << 'EOF' > lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Abaikan error jika dipanggil dari Server Component
          }
        },
      },
    }
  )
}
EOF

# 3. GENERATE: Supabase Middleware Core
echo "🛡️ 3. Membuat Fungsi Middleware Keamanan (lib/supabase/middleware.ts)..."
cat << 'EOF' > lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verifikasi token JWT pengguna
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Lakukan pengecekan Role jika user login
  let userRole = 'guest';
  if (user) {
    // Ambil role dari tabel profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile) userRole = profile.role;
  }

  // PROTEKSI ROUTING (RBAC)
  if (pathname.startsWith('/app/')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (pathname.startsWith('/app/customer') && userRole !== 'customer') {
      return NextResponse.redirect(new URL(`/app/${userRole}`, request.url))
    }
    if (pathname.startsWith('/app/ksatria') && userRole !== 'ksatria') {
      return NextResponse.redirect(new URL(`/app/${userRole}`, request.url))
    }
    if (pathname.startsWith('/app/admin') && userRole !== 'admin' && userRole !== 'super_admin') {
      return NextResponse.redirect(new URL(`/app/${userRole}`, request.url))
    }
  }

  // Jika sudah login, jauhkan dari halaman login/register
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL(`/app/${userRole}`, request.url))
  }

  return supabaseResponse
}
EOF

# 4. UPDATE: Main Next.js Middleware
echo "🔗 4. Menyambungkan utilitas ke Next.js Middleware (middleware.ts)..."
cat << 'EOF' > middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Melewatkan semua logika autentikasi ke Supabase Middleware yang telah kita buat
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
EOF

echo "======================================================================="
echo "✅ SPRINT 2 SELESAI: Mesin Keamanan Supabase berhasil di-generate!"
echo "Langkah selanjutnya: Eksekusi SQL di Supabase dan jalankan skrip ini."
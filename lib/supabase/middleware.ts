import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  let userRole = 'guest';
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) userRole = profile.role;
  }

  // PROTEKSI ROUTING (RBAC)
  if (pathname.startsWith('/app/')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    if (pathname.startsWith('/app/customer') && userRole !== 'customer') return NextResponse.redirect(new URL(`/app/${userRole === 'super_admin' ? 'admin' : userRole}`, request.url))
    if (pathname.startsWith('/app/ksatria') && userRole !== 'ksatria') return NextResponse.redirect(new URL(`/app/${userRole === 'super_admin' ? 'admin' : userRole}`, request.url))
    if (pathname.startsWith('/app/admin') && userRole !== 'admin' && userRole !== 'super_admin') return NextResponse.redirect(new URL(`/app/${userRole}`, request.url))
  }

  // Arahkan ke Dashboard yang tepat saat Login
  if (user && (pathname === '/login' || pathname === '/register')) {
    const targetFolder = userRole === 'super_admin' ? 'admin' : userRole;
    return NextResponse.redirect(new URL(`/app/${targetFolder}`, request.url))
  }

  return supabaseResponse
}

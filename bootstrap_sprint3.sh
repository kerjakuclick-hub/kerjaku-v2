#!/bin/bash

echo "🚀 [SPRINT 3] Membangun Sistem Login & Registrasi (Server Actions)..."
echo "======================================================================="

# 1. GENERATE: Server Actions untuk Auth
echo "🔒 1. Membuat Auth Server Actions (features/auth/services/auth-actions.ts)..."
mkdir -p features/auth/services
cat << 'EOF' > features/auth/services/auth-actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?message=Gagal login: Email atau Password salah')
  }

  // Jika berhasil, middleware akan otomatis mengarahkan user ke dashboard sesuai role-nya
  return redirect('/app/customer') 
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string || 'customer'
  
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phone,
        role: role,
      },
    },
  })

  if (error) {
    return redirect(`/register?message=Gagal mendaftar: ${error.message}`)
  }

  return redirect('/login?message=Pendaftaran berhasil! Silakan login.')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}
EOF

# 2. GENERATE: Auth Layout
echo "🖼️ 2. Membuat Layout Halaman Auth (app/(auth)/layout.tsx)..."
mkdir -p app/\(auth\)
cat << 'EOF' > app/\(auth\)/layout.tsx
import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 italic tracking-tight">kerjaKU<span className="text-slate-800">.click</span></h1>
          <p className="mt-2 text-sm text-slate-500">Urusan rumah jadi mudah.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
EOF

# 3. GENERATE: Login Page
echo "🔑 3. Membuat Halaman Login (app/(auth)/login/page.tsx)..."
mkdir -p app/\(auth\)/login
cat << 'EOF' > app/\(auth\)/login/page.tsx
import { login } from '@/features/auth/services/auth-actions'
import Link from 'next/link'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  const params = await searchParams;
  
  return (
    <form action={login} className="mt-8 space-y-6">
      {params?.message && (
        <div className="p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-sm font-bold text-center">
          {params.message}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
          <input name="email" type="email" required className="w-full p-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all" placeholder="contoh@email.com" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
          <input name="password" type="password" required className="w-full p-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all" placeholder="••••••••" />
        </div>
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]">
        Masuk Ruang Komando
      </button>
      <p className="text-center text-sm text-slate-500 font-medium">
        Belum punya akun? <Link href="/register" className="text-blue-600 hover:underline font-bold">Daftar sekarang</Link>
      </p>
    </form>
  )
}
EOF

# 4. GENERATE: Register Page
echo "📝 4. Membuat Halaman Register (app/(auth)/register/page.tsx)..."
mkdir -p app/\(auth\)/register
cat << 'EOF' > app/\(auth\)/register/page.tsx
import { signup } from '@/features/auth/services/auth-actions'
import Link from 'next/link'

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  const params = await searchParams;
  
  return (
    <form action={signup} className="mt-8 space-y-5">
      {params?.message && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold text-center">
          {params.message}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
          <input name="fullName" type="text" required className="w-full p-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600" placeholder="Budi Santoso" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1">No. WhatsApp</label>
          <input name="phone" type="tel" required className="w-full p-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600" placeholder="081234567890" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
          <input name="email" type="email" required className="w-full p-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600" placeholder="budi@email.com" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
          <input name="password" type="password" required className="w-full p-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600" placeholder="Minimal 6 karakter" minLength={6} />
        </div>
      </div>

      {/* Secara default mendaftar sebagai Klien. Nanti Admin bisa ubah Role di Dashboard System */}
      <input type="hidden" name="role" value="customer" />

      <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] mt-2">
        Buat Akun
      </button>
      
      <p className="text-center text-sm text-slate-500 font-medium pt-2">
        Sudah punya akun? <Link href="/login" className="text-blue-600 hover:underline font-bold">Masuk di sini</Link>
      </p>
    </form>
  )
}
EOF


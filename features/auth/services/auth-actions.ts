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

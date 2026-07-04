import { createClient } from '@/lib/supabase/server'

export async function getTugasKsatria() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Menarik tugas khusus untuk Ksatria yang sedang login
  // Menggunakan syntax relasi Supabase untuk mengambil profil klien
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      klien:profiles!orders_customer_id_fkey ( full_name, phone_number, avatar_url )
    `)
    .eq('ksatria_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Gagal mengambil data tugas ksatria:", error)
    return []
  }
  
  return data
}

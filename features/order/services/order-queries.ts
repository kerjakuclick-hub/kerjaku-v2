import { createClient } from '@/lib/supabase/server'

export async function getSemuaPesanan() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      klien:profiles!orders_customer_id_fkey ( full_name, phone_number )
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

// FUNGSI BARU: Mengambil semua akun yang berstatus Ksatria
export async function getDaftarKsatria() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone_number')
    .eq('role', 'ksatria')
  
  if (error) return []
  return data
}

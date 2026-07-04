import { createClient } from '@/lib/supabase/server'

export async function getBukuKas() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('company_ledger')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Gagal mengambil buku kas:", error)
    return []
  }
  return data
}

// FUNGSI BARU: Tarik data antrean penarikan dana
export async function getPendingWithdrawals() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*, ksatria:profiles(full_name, phone_number)')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true })
  
  if (error) return []
  return data
}

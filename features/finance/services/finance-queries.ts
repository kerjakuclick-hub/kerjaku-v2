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

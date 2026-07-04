#!/bin/bash
echo "🔧 Memperbaiki Radar Admin (Ambiguitas Relasi Supabase)..."

cat << 'EOF' > features/order/services/order-queries.ts
import { createClient } from '@/lib/supabase/server'

export async function getSemuaPesanan() {
  const supabase = await createClient()
  
  // PERBAIKAN: Menambahkan penunjuk '!orders_customer_id_fkey' secara eksplisit
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      klien:profiles!orders_customer_id_fkey ( full_name, phone_number )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Gagal mengambil data pesanan:", error)
    return []
  }
  
  return data
}
EOF

echo "✅ Radar Admin berhasil diperbaiki!"
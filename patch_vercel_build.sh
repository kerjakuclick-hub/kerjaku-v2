#!/bin/bash
echo "🔧 Memperbaiki Type Error secara paksa untuk Vercel..."

cat << 'EOF' > features/order/services/order-actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { getHargaLayanan } from '@/features/finance/services/financeEngine'
import { revalidatePath } from 'next/cache'

// FUNGSI 1: CREATE ORDER (Sudah Aman karena dipanggil via Client Component manual)
export async function createOrder(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Sesi tidak valid.")

    const service_id = formData.get('service_id') as string
    const schedule_date = formData.get('schedule_date') as string
    const schedule_slot = formData.get('schedule_slot') as string
    const address_detail = formData.get('address_detail') as string
    const calculated_price = getHargaLayanan(service_id)

    const { error } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        service_id: service_id,
        schedule_date: schedule_date,
        schedule_slot: schedule_slot,
        address_detail: address_detail,
        total_price: calculated_price,
        status: 'PENDING'
      })

    if (error) throw new Error(error.message)
    revalidatePath('/app/customer')
    return { success: true, message: "Pesanan berhasil dibuat!" }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// FUNGSI 2: DISPATCH KSATRIA (WAJIB PROMISE<VOID> UNTUK VERCEL)
export async function assignKsatria(formData: FormData): Promise<void> {
  try {
    const supabase = await createClient()
    const orderId = formData.get('order_id') as string
    const ksatriaId = formData.get('ksatria_id') as string

    if (!ksatriaId) {
      console.error("Ksatria harus dipilih!")
      return // Berhenti tanpa mengembalikan nilai (void)
    }

    const { error } = await supabase
      .from('orders')
      .update({ 
        ksatria_id: ksatriaId, 
        status: 'ON_PROGRESS' 
      })
      .eq('id', orderId)

    if (error) {
      console.error("Error dispatch:", error.message)
      return // Berhenti tanpa mengembalikan nilai (void)
    }
    
    // Refresh halaman Admin agar radar terupdate
    revalidatePath('/app/admin')
  } catch (error: any) {
    console.error("System error:", error.message)
  }
}
EOF

echo "✅ PATCH SELESAI: Fungsi Dispatch sekarang mematuhi standar ketat TypeScript!"
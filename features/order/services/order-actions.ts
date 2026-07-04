'use server'

import { createClient } from '@/lib/supabase/server'
import { getHargaLayanan } from '@/features/finance/services/financeEngine'
import { revalidatePath } from 'next/cache'

// Fungsi Create Order (Dari Sprint 5)
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

// FUNGSI BARU: Dispatch Ksatria
export async function assignKsatria(formData: FormData) {
  try {
    const supabase = await createClient()
    const orderId = formData.get('order_id') as string
    const ksatriaId = formData.get('ksatria_id') as string

    if (!ksatriaId) throw new Error("Ksatria harus dipilih!")

    // Update pesanan: masukkan ID ksatria & ubah status
    const { error } = await supabase
      .from('orders')
      .update({ 
        ksatria_id: ksatriaId, 
        status: 'ON_PROGRESS' 
      })
      .eq('id', orderId)

    if (error) throw new Error(error.message)
    
    // Refresh halaman Admin agar radar terupdate
    revalidatePath('/app/admin')
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

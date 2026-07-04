'use server'

import { createClient } from '@/lib/supabase/server'
import { SKEMA_KEUANGAN } from '@/features/finance/services/financeEngine'
import { revalidatePath } from 'next/cache'

export async function selesaikanTugas(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Sesi Ksatria tidak valid. Silakan login ulang.")

    const orderId = formData.get('order_id') as string
    if (!orderId) throw new Error("ID Pesanan tidak ditemukan.")

    // 1. Tarik & Validasi
    const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('id', orderId).single()
    if (orderErr || !order) throw new Error("Pesanan tidak ditemukan di database.")
    if (order.ksatria_id !== user.id) throw new Error("Akses ditolak: Ini bukan tugas Anda.")
    if (order.status === 'COMPLETED') throw new Error("Tugas ini sudah diselesaikan sebelumnya.")
    
    // 2. Ambil Skema
    const skema = SKEMA_KEUANGAN[order.service_id]
    if (!skema) throw new Error("Skema harga untuk layanan ini tidak ditemukan.")

    const pendapatanBersih = skema.harga - skema.fee - skema.tech - skema.bahan

    // 3. Update Status
    const { error: updateErr } = await supabase.from('orders').update({ status: 'COMPLETED' }).eq('id', orderId)
    if (updateErr) throw new Error("Gagal merubah status: " + updateErr.message)

    // 4. Dompet Ksatria (Hak Ksatria)
    const { data: wallet, error: getWalletErr } = await supabase.from('wallets').select('balance').eq('id', user.id).single()
    let currentBalance = 0;
    if (!getWalletErr && wallet) currentBalance = Number(wallet.balance) || 0;
    
    const { error: walletErr } = await supabase.from('wallets').upsert({ id: user.id, balance: currentBalance + pendapatanBersih, updated_at: new Date().toISOString() })
    if (walletErr) throw new Error("Gagal mengupdate saldo: " + walletErr.message)

    // 5. Riwayat Dompet Ksatria
    await supabase.from('wallet_transactions').insert({
      wallet_id: user.id, order_id: orderId, amount: pendapatanBersih, type: 'INCOME', description: `Pendapatan tugas: ${skema.nama}`
    })

    // =========================================================================
    // 6. [NEW] BUKU KAS PERUSAHAAN (Hak Platform)
    // =========================================================================
    const companyLedgerEntries = [
      { order_id: orderId, type: 'INCOME', category: 'PLATFORM_FEE', amount: skema.fee, description: `Komisi Platform: ${skema.nama}` },
      { order_id: orderId, type: 'INCOME', category: 'TECH_FEE', amount: skema.tech, description: `Biaya Teknologi: ${skema.nama}` },
      { order_id: orderId, type: 'INCOME', category: 'MATERIAL_FEE', amount: skema.bahan, description: `Penggantian Bahan: ${skema.nama}` }
    ];
    
    const { error: kasErr } = await supabase.from('company_ledger').insert(companyLedgerEntries)
    if (kasErr) throw new Error("Gagal mencatat kas perusahaan: " + kasErr.message)

    revalidatePath('/app/ksatria')
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || "Terjadi kesalahan internal." }
  }
}

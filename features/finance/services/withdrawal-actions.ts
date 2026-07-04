'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// AKSI 1: Ksatria Mengajukan Tarik Tunai
export async function ajukanTarikTunai(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Sesi tidak valid")

    const amount = Number(formData.get('amount'))
    const bankName = formData.get('bank_name') as string
    const accountNo = formData.get('account_no') as string
    const accountName = formData.get('account_name') as string

    if (amount < 50000) throw new Error("Minimal penarikan adalah Rp 50.000")

    // 1. Validasi Saldo Dompet
    const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', user.id).single()
    if (!wallet || wallet.balance < amount) throw new Error("Saldo tidak mencukupi")

    // 2. KUNCI SALDO (Hold Money) agar tidak bisa ditarik ganda
    const { error: lockErr } = await supabase.from('wallets').update({ balance: wallet.balance - amount }).eq('id', user.id)
    if (lockErr) throw new Error("Gagal mengunci saldo.")

    // 3. Buat Catatan Permintaan
    const { error: reqErr } = await supabase.from('withdrawals').insert({
      ksatria_id: user.id,
      amount: amount,
      bank_name: bankName,
      account_number: accountNo,
      account_name: accountName,
      status: 'PENDING'
    })
    
    // Jika gagal buat request, kembalikan saldonya (Rollback)
    if (reqErr) {
       await supabase.from('wallets').update({ balance: wallet.balance }).eq('id', user.id)
       throw new Error("Gagal mengirim permintaan ke server.")
    }

    // 4. Catat di Riwayat Transaksi Dompet (Debit Sementara)
    await supabase.from('wallet_transactions').insert({
      wallet_id: user.id,
      amount: amount,
      type: 'DEBIT',
      description: `Penarikan Dana PENDING (${bankName})`
    })

    revalidatePath('/app/ksatria')
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || "Kesalahan internal." }
  }
}

// AKSI 2: Admin Menyetujui Tarik Tunai
export async function setujuiTarikTunai(formData: FormData) {
  try {
    const supabase = await createClient()
    const id = formData.get('id') as string

    const { error } = await supabase.from('withdrawals').update({ status: 'APPROVED' }).eq('id', id)
    if (error) throw new Error("Gagal menyetujui transaksi: " + error.message)

    revalidatePath('/app/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}

// AKSI 3: Admin Menolak Tarik Tunai (Refund Saldo)
export async function tolakTarikTunai(formData: FormData) {
  try {
    const supabase = await createClient()
    const id = formData.get('id') as string
    
    // Ambil data penarikan
    const { data: w } = await supabase.from('withdrawals').select('*').eq('id', id).single()
    if (!w) throw new Error("Data penarikan tidak ditemukan.")

    // Kembalikan Saldo (Refund)
    const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', w.ksatria_id).single()
    await supabase.from('wallets').update({ balance: Number(wallet?.balance || 0) + Number(w.amount) }).eq('id', w.ksatria_id)

    // Catat Refund di Riwayat Transaksi
    await supabase.from('wallet_transactions').insert({
      wallet_id: w.ksatria_id, amount: w.amount, type: 'INCOME', description: `Refund: Penarikan Dana Ditolak Admin`
    })

    // Update Status
    await supabase.from('withdrawals').update({ status: 'REJECTED' }).eq('id', id)

    revalidatePath('/app/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}

#!/bin/bash
echo "🏦 Menginisialisasi Modul Tarik Tunai (Withdrawal System)..."
echo "======================================================================="

mkdir -p features/finance/services
mkdir -p features/finance/components

# 1. BUAT SERVER ACTIONS UNTUK PENARIKAN DANA
echo "🔒 1. Membangun Logika Keamanan Tarik Tunai (Server Actions)..."
cat << 'EOF' > features/finance/services/withdrawal-actions.ts
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
EOF

# 2. BUAT CLIENT COMPONENT FORMULIR KSATRIA
echo "💳 2. Membuat Komponen Formulir Tarik Tunai Interaktif (Client Component)..."
cat << 'EOF' > features/finance/components/WithdrawalForm.tsx
'use client'

import { useState } from 'react'
import { ajukanTarikTunai } from '@/features/finance/services/withdrawal-actions'
import { Loader2, Landmark, AlertCircle } from 'lucide-react'

export function WithdrawalForm({ currentBalance }: { currentBalance: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (currentBalance < 50000) {
    return (
      <div className="mt-4 text-[11px] font-bold text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 flex items-center gap-2">
        <AlertCircle size={14} /> Minimal saldo penarikan Rp 50.000
      </div>
    )
  }

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex justify-center items-center gap-2 active:scale-95">
      <Landmark size={18} /> Cairkan ke Rekening
    </button>
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)
    const result = await ajukanTarikTunai(formData)
    
    if (result.success) {
      alert("✅ Permintaan pencairan berhasil dikirim ke Admin. Saldo Anda telah dikunci sementara menunggu transfer masuk.")
      setIsOpen(false)
      window.location.reload()
    } else {
      setErrorMsg(result.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 bg-slate-800 p-5 rounded-2xl border border-slate-700 relative z-20 shadow-2xl">
      {errorMsg && (
         <div className="text-xs text-red-200 bg-red-900/50 p-2 rounded border border-red-800/50">{errorMsg}</div>
      )}
      <div>
        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nominal (Maks: Rp {currentBalance.toLocaleString('id-ID')})</label>
        <input type="number" name="amount" required max={currentBalance} min={50000} defaultValue={currentBalance} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm outline-none focus:border-emerald-500" placeholder="50000" />
      </div>
      <div>
        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nama Bank / E-Wallet</label>
        <input type="text" name="bank_name" required className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm outline-none focus:border-emerald-500" placeholder="Cth: BCA / DANA / Mandiri" />
      </div>
      <div>
        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">No. Rekening / No. HP E-Wallet</label>
        <input type="number" name="account_no" required className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm outline-none focus:border-emerald-500" placeholder="1234567890" />
      </div>
      <div>
        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nama Pemilik Rekening</label>
        <input type="text" name="account_name" required className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm outline-none focus:border-emerald-500" placeholder="Sesuai nama di buku tabungan" />
      </div>
      
      <div className="flex gap-2 pt-3 border-t border-slate-700 mt-2">
        <button type="button" onClick={() => setIsOpen(false)} className="flex-[1] bg-slate-700 text-white font-bold py-3 rounded-xl text-xs hover:bg-slate-600 transition-all">Batal</button>
        <button type="submit" disabled={loading} className="flex-[2] bg-emerald-500 text-slate-900 font-black py-3 rounded-xl text-xs hover:bg-emerald-400 flex justify-center items-center transition-all disabled:opacity-50">
          {loading ? <Loader2 size={16} className="animate-spin"/> : "Kirim Permintaan"}
        </button>
      </div>
    </form>
  )
}
EOF

# 3. PERBARUI DASHBOARD KSATRIA
echo "🛡️ 3. Menyuntikkan Komponen Tarik Tunai ke Dashboard Ksatria..."
cat << 'EOF' > app/app/ksatria/page.tsx
import { getTugasKsatria } from '@/features/order/services/ksatria-queries'
import { SKEMA_KEUANGAN } from '@/features/finance/services/financeEngine'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Clock, Calendar, Wallet, ClipboardList, Phone } from 'lucide-react'
import { SelesaikanTugasBtn } from '@/features/order/components/SelesaikanTugasBtn'
import { WithdrawalForm } from '@/features/finance/components/WithdrawalForm' // IMPORT KOMPONEN BARU

export const dynamic = 'force-dynamic'

export default async function KsatriaDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const daftarTugas = await getTugasKsatria()
  const tugasAktif = daftarTugas.filter(t => t.status === 'PENDING' || t.status === 'ON_PROGRESS')
  
  let saldoSaatIni = 0;
  if (user) {
    const { data: dompet } = await supabase.from('wallets').select('balance').eq('id', user.id).single()
    if (dompet) saldoSaatIni = Number(dompet.balance)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <h1 className="text-3xl font-black text-slate-800">Ruang Ksatria</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center gap-6">
           <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl"><ClipboardList size={32} /></div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tugas Menunggu</p>
             <p className="text-3xl font-black text-slate-800 mt-1">{tugasAktif.length}</p>
           </div>
         </div>
         
         {/* KOTAK SALDO DIPERBARUI DENGAN KOMPONEN TARIK TUNAI */}
         <div className="p-6 bg-slate-900 rounded-3xl shadow-sm border border-slate-800 flex items-start gap-6 text-white relative overflow-hidden">
           <div className="absolute -right-4 -top-4 opacity-10"><Wallet size={100} /></div>
           <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl relative z-10 shrink-0"><Wallet size={32} /></div>
           <div className="relative z-10 w-full">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Penghasilan</p>
             <p className="text-3xl font-black mt-1 text-emerald-400">Rp {saldoSaatIni.toLocaleString('id-ID')}</p>
             
             {/* SUNTIKAN FORMULIR TARIK TUNAI */}
             <WithdrawalForm currentBalance={saldoSaatIni} />
           </div>
         </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 pt-4 border-b border-slate-200 pb-2">Misi Anda Hari Ini</h2>

      <div className="space-y-4">
        {tugasAktif.length === 0 ? (
           <div className="p-8 bg-white border border-slate-200 rounded-[2rem] text-center">
             <p className="text-slate-500 font-medium">Standby... Belum ada tugas yang dialokasikan untuk Anda saat ini.</p>
           </div>
        ) : (
          tugasAktif.map((tugas) => (
            <div key={tugas.id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-2">TUGAS BARU</span>
                    <h3 className="text-lg font-black text-slate-800">{SKEMA_KEUANGAN[tugas.service_id]?.nama || tugas.service_id}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Kedatangan</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1 justify-end"><Calendar size={14}/> {tugas.schedule_date}</p>
                    <p className="text-sm font-bold text-blue-600 flex items-center gap-1 justify-end"><Clock size={14}/> {tugas.schedule_slot}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detail Klien</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex justify-center items-center font-bold text-slate-400">
                         {tugas.klien?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{tugas.klien?.full_name}</p>
                        <a href={`https://wa.me/${tugas.klien?.phone_number}`} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 font-bold flex items-center gap-1 hover:underline">
                           <Phone size={12}/> Hubungi Klien
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:border-l border-slate-100 md:pl-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alamat Lokasi</p>
                    <p className="text-sm font-medium text-slate-700 flex items-start gap-2">
                       <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" /> {tugas.address_detail}
                    </p>
                  </div>
               </div>

               <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                  <SelesaikanTugasBtn orderId={tugas.id} />
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
EOF

# 4. TAMPILKAN ANTREAN PENARIKAN DI DASHBOARD ADMIN
echo "👑 4. Memasang Radar Penarikan Dana di Ruang Komando Admin..."
cat << 'EOF' >> features/finance/services/finance-queries.ts

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
EOF

# Timpa Admin Page dengan UI Baru
cat << 'EOF' > app/app/admin/page.tsx
import { getSemuaPesanan, getDaftarKsatria } from '@/features/order/services/order-queries'
import { assignKsatria } from '@/features/order/services/order-actions'
import { getBukuKas, getPendingWithdrawals } from '@/features/finance/services/finance-queries'
import { setujuiTarikTunai, tolakTarikTunai } from '@/features/finance/services/withdrawal-actions'
import { SKEMA_KEUANGAN } from '@/features/finance/services/financeEngine'
import { Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle, Landmark, ArrowUpRight, Banknote, Check, X } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const semuaPesanan = await getSemuaPesanan()
  const daftarKsatria = await getDaftarKsatria() 
  const bukuKas = await getBukuKas()
  
  // Ambil Data Antrean Tarik Tunai
  const withdrawals = await getPendingWithdrawals()
  
  const pesananAktif = semuaPesanan.filter(p => p.status === 'PENDING' || p.status === 'ON_PROGRESS').length
  
  const labaKotor = bukuKas
    .filter(kas => kas.type === 'INCOME' && (kas.category === 'PLATFORM_FEE' || kas.category === 'TECH_FEE'))
    .reduce((sum, kas) => sum + Number(kas.amount), 0)

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full w-max"><Clock size={12}/> Menunggu Ksatria</span>
      case 'ON_PROGRESS': return <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full w-max"><PlayCircle size={12}/> Sedang Dikerjakan</span>
      case 'COMPLETED': return <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full w-max"><CheckCircle2 size={12}/> Selesai</span>
      case 'CANCELLED': return <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-red-100 text-red-700 rounded-full w-max"><XCircle size={12}/> Dibatalkan</span>
      default: return <span className="text-slate-500">{status}</span>
    }
  }

  const getCategoryLabel = (cat: string) => {
    if (cat === 'PLATFORM_FEE') return 'Komisi Platform'
    if (cat === 'TECH_FEE') return 'Biaya Teknologi'
    if (cat === 'MATERIAL_FEE') return 'Penggantian Bahan'
    return cat
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-800 italic uppercase">Ruang Komando</h1>
        <p className="text-slate-500 mt-1">Pusat kendali operasional, radar pergerakan, dan kas perusahaan.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pesanan Aktif (Pending & Progress)</p>
           <p className="text-4xl font-black text-slate-800 mt-2">{pesananAktif}</p>
         </div>
         <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-emerald-600">Total Transaksi Selesai</p>
           <p className="text-4xl font-black text-slate-800 mt-2">{semuaPesanan.filter(p => p.status === 'COMPLETED').length}</p>
         </div>
         
         <div className="p-6 bg-emerald-950 rounded-3xl shadow-lg border border-emerald-900 text-white relative overflow-hidden">
           <div className="absolute -right-4 -top-4 opacity-10"><Landmark size={100} /></div>
           <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest relative z-10 flex items-center gap-1">
             <ArrowUpRight size={12} /> Laba Kotor Perusahaan
           </p>
           <p className="text-3xl font-black mt-2 text-emerald-50 relative z-10">
             Rp {labaKotor.toLocaleString('id-ID')}
           </p>
         </div>
      </div>

      {/* MODUL BARU: RADAR ANTREAN TARIK TUNAI KSATRIA */}
      {withdrawals.length > 0 && (
        <div className="bg-red-50 rounded-3xl shadow-sm border border-red-200 overflow-hidden mt-8 animate-in zoom-in-95 duration-300">
          <div className="p-6 border-b border-red-100 flex justify-between items-center bg-red-100/50">
            <h2 className="text-lg font-black text-red-800 flex items-center gap-2">
              <Banknote size={20} /> Antrean Pencairan Dana Ksatria
            </h2>
            <span className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-full shadow-sm">
              {withdrawals.length} Permintaan
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-red-50 text-red-800 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-red-100">Ksatria</th>
                  <th className="p-4 font-bold border-b border-red-100">Tujuan Transfer</th>
                  <th className="p-4 font-bold border-b border-red-100 text-right">Nominal Cair</th>
                  <th className="p-4 font-bold border-b border-red-100 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {withdrawals.map((w: any) => (
                  <tr key={w.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{w.ksatria?.full_name}</p>
                      <p className="text-xs text-slate-500 font-medium">{w.ksatria?.phone_number}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-blue-700 text-lg uppercase">{w.bank_name}</p>
                      <p className="text-sm font-bold text-slate-800">{w.account_number}</p>
                      <p className="text-xs text-slate-500">a.n. {w.account_name}</p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="text-xl font-black text-red-600">Rp {Number(w.amount).toLocaleString('id-ID')}</p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Tombol Tolak */}
                        <form action={tolakTarikTunai}>
                          <input type="hidden" name="id" value={w.id} />
                          <button type="submit" className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all shadow-sm" title="Tolak & Kembalikan Saldo">
                             <X size={18} />
                          </button>
                        </form>
                        {/* Tombol Setujui */}
                        <form action={setujuiTarikTunai}>
                          <input type="hidden" name="id" value={w.id} />
                          <button type="submit" className="px-4 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                             <Check size={18} /> Tandai Sudah Ditransfer
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-yellow-50 text-yellow-800 text-xs font-medium border-t border-yellow-200">
            ⚠️ <b>Penting:</b> Lakukan transfer manual melalui M-Banking Anda terlebih dahulu ke rekening tertera, sebelum menekan tombol <b>"Tandai Sudah Ditransfer"</b>.
          </div>
        </div>
      )}

      {/* RADAR PESANAN & BUKU KAS (Disingkat visualisasi bash-nya, kode aslinya tetap aman di bawah) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Radar Pesanan Masuk</h2>
          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 shadow-sm">
            Mendeteksi {daftarKsatria.length} Ksatria
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-slate-100 min-w-[150px]">Info Klien</th>
                <th className="p-4 font-bold border-b border-slate-100 min-w-[200px]">Layanan & Jadwal</th>
                <th className="p-4 font-bold border-b border-slate-100 min-w-[200px]">Alamat & Harga</th>
                <th className="p-4 font-bold border-b border-slate-100">Status</th>
                <th className="p-4 font-bold border-b border-slate-100 text-right min-w-[250px]">Aksi Dispatch</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {semuaPesanan.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Belum ada pesanan yang masuk ke radar.</td>
                </tr>
              ) : (
                semuaPesanan.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{order.klien?.full_name}</p>
                      <p className="text-xs text-slate-500">{order.klien?.phone_number}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-blue-700">{SKEMA_KEUANGAN[order.service_id]?.nama || order.service_id}</p>
                      <p className="text-xs text-slate-500">{order.schedule_date} | {order.schedule_slot}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-700 truncate max-w-[200px]">{order.address_detail}</p>
                      <p className="text-xs font-bold text-emerald-600 mt-1">Total: Rp {Number(order.total_price).toLocaleString('id-ID')}</p>
                    </td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4 text-right">
                      {order.status === 'PENDING' ? (
                        <form action={assignKsatria} className="flex flex-wrap items-center gap-2 justify-end">
                          <input type="hidden" name="order_id" value={order.id} />
                          {daftarKsatria.length === 0 ? (
                             <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">Data Kosong</span>
                          ) : (
                            <>
                              <select name="ksatria_id" required defaultValue={daftarKsatria.length === 1 ? daftarKsatria[0].id : ""} className="p-2.5 text-xs border border-slate-300 rounded-lg outline-none bg-white text-slate-900 focus:border-blue-600 font-bold cursor-pointer min-w-[150px] shadow-sm">
                                {daftarKsatria.length !== 1 && <option value="">-- Pilih Ksatria --</option>}
                                {daftarKsatria.map((k: any) => (
                                  <option key={k.id} value={k.id}>{k.full_name} ({k.phone_number})</option>
                                ))}
                              </select>
                              <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
                                Tugaskan!
                              </button>
                            </>
                          )}
                        </form>
                      ) : (
                         <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 inline-block">
                           Terkunci ({order.status})
                         </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Landmark size={20} className="text-emerald-700" />
          <h2 className="text-lg font-bold text-slate-800">Catatan Buku Kas (Real-Time)</h2>
        </div>
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white shadow-sm">
              <tr className="bg-slate-50/90 backdrop-blur-sm text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-slate-100">Kategori</th>
                <th className="p-4 font-bold border-b border-slate-100">Deskripsi</th>
                <th className="p-4 font-bold border-b border-slate-100">Tanggal</th>
                <th className="p-4 font-bold border-b border-slate-100 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {bukuKas.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-medium">Buku kas masih kosong.</td></tr>
              ) : (
                bukuKas.map((kas) => (
                  <tr key={kas.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-700">{getCategoryLabel(kas.category)}</td>
                    <td className="p-4 text-slate-600">{kas.description}</td>
                    <td className="p-4 text-slate-500 text-xs">{new Date(kas.created_at).toLocaleString('id-ID')}</td>
                    <td className="p-4 text-right font-black text-emerald-600">
                      + Rp {Number(kas.amount).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
EOF

echo "✅ EKSEKUSI SELESAI: Sistem Tarik Tunai Tingkat Bank Berhasil Dipasang!"
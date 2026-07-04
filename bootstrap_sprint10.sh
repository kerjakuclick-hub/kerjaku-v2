#!/bin/bash
echo "🚀 [SPRINT 10] Membangun Buku Kas & Mengkalibrasi Ulang Radar Admin..."
echo "======================================================================="

# 1. UPDATE: Mesin Keuangan Ksatria (Otomatis Pecah Dana)
echo "🧮 1. Mengkalibrasi Mesin Keuangan (features/order/services/ksatria-actions.ts)..."
cat << 'EOF' > features/order/services/ksatria-actions.ts
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
EOF

# 2. GENERATE: Query Buku Kas
echo "🔍 2. Membuat Query Buku Kas (features/finance/services/finance-queries.ts)..."
cat << 'EOF' > features/finance/services/finance-queries.ts
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
EOF

# 3. UPDATE: Ruang Komando Admin
echo "👑 3. Memperbarui Radar Ruang Komando (app/app/admin/page.tsx)..."
cat << 'EOF' > app/app/admin/page.tsx
import { getSemuaPesanan, getDaftarKsatria } from '@/features/order/services/order-queries'
import { assignKsatria } from '@/features/order/services/order-actions'
import { getBukuKas } from '@/features/finance/services/finance-queries'
import { SKEMA_KEUANGAN } from '@/features/finance/services/financeEngine'
import { Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle, Landmark, ArrowUpRight } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function AdminDashboard() {
  const semuaPesanan = await getSemuaPesanan()
  const daftarKsatria = await getDaftarKsatria() 
  const bukuKas = await getBukuKas()
  
  const pesananAktif = semuaPesanan.filter(p => p.status === 'PENDING' || p.status === 'ON_PROGRESS').length
  
  // Kalkulasi Laba Kotor (Hanya Fee Platform + Tech Fee, Tidak termasuk Bahan/Hak Mitra)
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
         
         {/* UPDATE: KOTAK LABA KOTOR PERUSAHAAN (REAL-TIME) */}
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

      {/* BUKU KAS PERUSAHAAN */}
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
echo "✅ Pembaruan Radar & Buku Kas Berhasil!"
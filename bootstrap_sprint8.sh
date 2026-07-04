#!/bin/bash

echo "🚀 [SPRINT 8] Mengaktifkan Sistem Penugasan (Dispatch)..."
echo "======================================================================="

# 1. UPDATE: Tambah Query untuk Mengambil Daftar Ksatria
echo "🔍 1. Memperbarui Query Data (features/order/services/order-queries.ts)..."
cat << 'EOF' > features/order/services/order-queries.ts
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
EOF

# 2. UPDATE: Tambah Server Action untuk Dispatch
echo "🛡️ 2. Menambah Logika Dispatch (features/order/services/order-actions.ts)..."
cat << 'EOF' > features/order/services/order-actions.ts
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
EOF

# 3. UPDATE: Ruang Komando UI
echo "👑 3. Memperbarui UI Ruang Komando (app/app/admin/page.tsx)..."
cat << 'EOF' > app/app/admin/page.tsx
import { getSemuaPesanan, getDaftarKsatria } from '@/features/order/services/order-queries'
import { assignKsatria } from '@/features/order/services/order-actions'
import { SKEMA_KEUANGAN } from '@/features/finance/services/financeEngine'
import { Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle } from 'lucide-react'

export default async function AdminDashboard() {
  const semuaPesanan = await getSemuaPesanan()
  const daftarKsatria = await getDaftarKsatria() // Ambil daftar Ksatria
  
  const pesananAktif = semuaPesanan.filter(p => p.status === 'PENDING' || p.status === 'ON_PROGRESS').length
  const totalPendapatan = semuaPesanan
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (Number(p.total_price) || 0), 0)

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full w-max"><Clock size={12}/> Menunggu Ksatria</span>
      case 'ON_PROGRESS': return <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full w-max"><PlayCircle size={12}/> Sedang Dikerjakan</span>
      case 'COMPLETED': return <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full w-max"><CheckCircle2 size={12}/> Selesai</span>
      case 'CANCELLED': return <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-red-100 text-red-700 rounded-full w-max"><XCircle size={12}/> Dibatalkan</span>
      default: return <span className="text-slate-500">{status}</span>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-800 italic uppercase">Ruang Komando</h1>
        <p className="text-slate-500 mt-1">Pusat kendali operasional dan pemantauan pergerakan Ksatria kerjaKU.</p>
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
         <div className="p-6 bg-slate-900 rounded-3xl shadow-lg border border-slate-800 text-white relative overflow-hidden">
           <div className="absolute -right-4 -top-4 opacity-10"><AlertCircle size={100} /></div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Total Nilai Transaksi Sukses</p>
           <p className="text-3xl font-black mt-2 text-blue-400 relative z-10">
             Rp {totalPendapatan.toLocaleString('id-ID')}
           </p>
         </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Radar Pesanan Masuk</h2>
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
                      <p className="text-xs font-bold text-emerald-600 mt-1">Rp {Number(order.total_price).toLocaleString('id-ID')}</p>
                    </td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4 text-right">
                      
                      {/* LOGIKA TOMBOL DISPATCH */}
                      {order.status === 'PENDING' ? (
                        <form action={assignKsatria} className="flex flex-wrap items-center gap-2 justify-end">
                          <input type="hidden" name="order_id" value={order.id} />
                          <select name="ksatria_id" required className="p-2.5 text-xs border border-slate-200 rounded-lg outline-none bg-slate-50 focus:border-blue-500 font-medium cursor-pointer">
                            <option value="">-- Pilih Ksatria --</option>
                            {daftarKsatria.map(k => (
                              <option key={k.id} value={k.id}>{k.full_name} ({k.phone_number})</option>
                            ))}
                          </select>
                          <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
                            Tugaskan!
                          </button>
                        </form>
                      ) : (
                         <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 inline-block">
                           Terkunci (On Progress)
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
    </div>
  )
}
EOF

echo "======================================================================="
echo "✅ SPRINT 8 SELESAI: Sistem Dispatch Ksatria Berhasil Diaktifkan!"
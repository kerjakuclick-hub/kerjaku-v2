#!/bin/bash

echo "🚀 [SPRINT 6] Membangun Radar Pemantauan Pesanan (Admin Dashboard)..."
echo "======================================================================="

# 1. GENERATE: Query Data Pesanan
echo "🔍 1. Membuat Fungsi Penarikan Data (features/order/services/order-queries.ts)..."
cat << 'EOF' > features/order/services/order-queries.ts
import { createClient } from '@/lib/supabase/server'

export async function getSemuaPesanan() {
  const supabase = await createClient()
  
  // Menarik data pesanan sekaligus menggabungkannya (JOIN) dengan data profil Klien
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      klien:profiles ( full_name, phone_number )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Gagal mengambil data pesanan:", error)
    return []
  }
  
  return data
}
EOF

# 2. UPDATE: Admin Dashboard (Ruang Komando)
echo "👑 2. Memperbarui Tampilan Ruang Komando (app/app/admin/page.tsx)..."
cat << 'EOF' > app/app/admin/page.tsx
import { getSemuaPesanan } from '@/features/order/services/order-queries'
import { SKEMA_KEUANGAN } from '@/features/finance/services/financeEngine'
import { Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle } from 'lucide-react'

export default async function AdminDashboard() {
  const semuaPesanan = await getSemuaPesanan()
  
  // Kalkulasi Statistik Cepat
  const pesananAktif = semuaPesanan.filter(p => p.status === 'PENDING' || p.status === 'ON_PROGRESS').length
  const totalPendapatan = semuaPesanan
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (Number(p.total_price) || 0), 0)

  // Fungsi helper untuk badge status
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full"><Clock size={12}/> Menunggu Ksatria</span>
      case 'ON_PROGRESS': return <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full"><PlayCircle size={12}/> Sedang Dikerjakan</span>
      case 'COMPLETED': return <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full"><CheckCircle2 size={12}/> Selesai</span>
      case 'CANCELLED': return <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-red-100 text-red-700 rounded-full"><XCircle size={12}/> Dibatalkan</span>
      default: return <span className="text-slate-500">{status}</span>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-800 italic uppercase">Ruang Komando</h1>
        <p className="text-slate-500 mt-1">Pusat kendali operasional dan pemantauan pergerakan Ksatria kerjaKU.</p>
      </div>
      
      {/* 3 Kotak Statistik */}
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

      {/* Tabel Radar Pesanan */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Radar Pesanan Masuk</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-slate-100">Info Klien</th>
                <th className="p-4 font-bold border-b border-slate-100">Layanan & Jadwal</th>
                <th className="p-4 font-bold border-b border-slate-100">Alamat & Harga</th>
                <th className="p-4 font-bold border-b border-slate-100">Status</th>
                <th className="p-4 font-bold border-b border-slate-100 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {semuaPesanan.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                    Belum ada pesanan yang masuk ke radar.
                  </td>
                </tr>
              ) : (
                semuaPesanan.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{order.klien?.full_name || 'Klien Tidak Dikenal'}</p>
                      <p className="text-xs text-slate-500">{order.klien?.phone_number || '-'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-blue-700">{SKEMA_KEUANGAN[order.service_id]?.nama || order.service_id}</p>
                      <p className="text-xs text-slate-500">{order.schedule_date} | {order.schedule_slot}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-700 truncate max-w-[200px]" title={order.address_detail}>
                        {order.address_detail}
                      </p>
                      <p className="text-xs font-bold text-emerald-600 mt-1">Rp {Number(order.total_price).toLocaleString('id-ID')}</p>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4 text-right">
                      {/* Tombol Dispatch akan kita kerjakan di Sprint selanjutnya */}
                      <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50" disabled={order.status !== 'PENDING'}>
                        Tugaskan Ksatria
                      </button>
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


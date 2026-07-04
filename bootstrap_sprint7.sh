#!/bin/bash

echo "🚀 [SPRINT 7] Membangun Markas Ksatria (Dashboard Mitra)..."
echo "======================================================================="

# 1. GENERATE: Query Khusus Ksatria
echo "🔍 1. Membuat Fungsi Data Ksatria (features/order/services/ksatria-queries.ts)..."
cat << 'EOF' > features/order/services/ksatria-queries.ts
import { createClient } from '@/lib/supabase/server'

export async function getTugasKsatria() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Menarik tugas khusus untuk Ksatria yang sedang login
  // Menggunakan syntax relasi Supabase untuk mengambil profil klien
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      klien:profiles!orders_customer_id_fkey ( full_name, phone_number, avatar_url )
    `)
    .eq('ksatria_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Gagal mengambil data tugas ksatria:", error)
    return []
  }
  
  return data
}
EOF

# 2. UPDATE: Ksatria Dashboard UI
echo "🛡️ 2. Memperbarui Tampilan Ruang Ksatria (app/app/ksatria/page.tsx)..."
cat << 'EOF' > app/app/ksatria/page.tsx
import { getTugasKsatria } from '@/features/order/services/ksatria-queries'
import { SKEMA_KEUANGAN } from '@/features/finance/services/financeEngine'
import { MapPin, Clock, Calendar, CheckCircle2, Wallet, ClipboardList, Phone } from 'lucide-react'

export default async function KsatriaDashboard() {
  const daftarTugas = await getTugasKsatria()
  
  // Pisahkan tugas berdasarkan status
  const tugasAktif = daftarTugas.filter(t => t.status === 'PENDING' || t.status === 'ON_PROGRESS')
  const tugasSelesai = daftarTugas.filter(t => t.status === 'COMPLETED')
  
  // Kalkulasi Pendapatan Sementara (Simulasi)
  const estimasiPendapatan = tugasSelesai.reduce((sum, t) => {
    const skema = SKEMA_KEUANGAN[t.service_id];
    const pendapatanBersih = skema ? (skema.harga - skema.fee - skema.tech - skema.bahan) : 0;
    return sum + pendapatanBersih;
  }, 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <h1 className="text-3xl font-black text-slate-800">Ruang Ksatria</h1>
      
      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center gap-6">
           <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl"><ClipboardList size={32} /></div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tugas Menunggu</p>
             <p className="text-3xl font-black text-slate-800 mt-1">{tugasAktif.length}</p>
           </div>
         </div>
         <div className="p-6 bg-slate-900 rounded-3xl shadow-sm border border-slate-800 flex items-center gap-6 text-white">
           <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl"><Wallet size={32} /></div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Est. Pendapatan (Bersih)</p>
             <p className="text-3xl font-black mt-1">Rp {estimasiPendapatan.toLocaleString('id-ID')}</p>
           </div>
         </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 pt-4 border-b border-slate-200 pb-2">Misi Anda Hari Ini</h2>

      {/* Daftar Tugas */}
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
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-2">
                      TUGAS BARU
                    </span>
                    <h3 className="text-lg font-black text-slate-800">
                      {SKEMA_KEUANGAN[tugas.service_id]?.nama || tugas.service_id}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Kedatangan</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1 justify-end">
                      <Calendar size={14}/> {tugas.schedule_date}
                    </p>
                    <p className="text-sm font-bold text-blue-600 flex items-center gap-1 justify-end">
                      <Clock size={14}/> {tugas.schedule_slot}
                    </p>
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
                       <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                       {tugas.address_detail}
                    </p>
                  </div>
               </div>

               <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                  <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                    <CheckCircle2 size={18} /> Tandai Selesai Kerja
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
EOF

echo "======================================================================="
echo "✅ SPRINT 7 SELESAI: Markas Ksatria berhasil dibangun dengan aman!"
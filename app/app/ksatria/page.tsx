import { getTugasKsatria } from '@/features/order/services/ksatria-queries'
import { SKEMA_KEUANGAN } from '@/features/finance/services/financeEngine'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Clock, Calendar, Wallet, ClipboardList, Phone } from 'lucide-react'
import { SelesaikanTugasBtn } from '@/features/order/components/SelesaikanTugasBtn' // IMPORT KOMPONEN BARU

// Paksa Matikan Cache agar data tugas dan saldo selalu real-time
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
         <div className="p-6 bg-slate-900 rounded-3xl shadow-sm border border-slate-800 flex items-center gap-6 text-white relative overflow-hidden">
           <div className="absolute -right-4 -top-4 opacity-10"><Wallet size={100} /></div>
           <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl relative z-10"><Wallet size={32} /></div>
           <div className="relative z-10">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Penghasilan</p>
             <p className="text-3xl font-black mt-1 text-emerald-400">Rp {saldoSaatIni.toLocaleString('id-ID')}</p>
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

               {/* TOMBOL BERBASIS CLIENT COMPONENT */}
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

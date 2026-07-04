'use client'

import { useState } from 'react'
import { Zap, CheckCircle2, Loader2, Calendar, MapPin, Clock } from 'lucide-react'
import { SKEMA_KEUANGAN } from '@/features/finance/services/financeEngine'
import { createOrder } from '@/features/order/services/order-actions'

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(false)
  const [selectedService, setSelectedService] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: null, msg: '' })

    const formData = new FormData(e.currentTarget)
    const result = await createOrder(formData)

    if (result.success) {
      setStatus({ type: 'success', msg: result.message })
      setSelectedService('')
      ;(e.target as HTMLFormElement).reset() 
    } else {
      setStatus({ type: 'error', msg: result.message })
    }
    setLoading(false)
  }

  const today = new Date().toISOString().split('T')[0]

  // Filter Kategori untuk Dropdown agar Rapi
  const cuciPaddock = Object.entries(SKEMA_KEUANGAN).filter(([id]) => id.startsWith('CP-'))
  const cuciRumah = Object.entries(SKEMA_KEUANGAN).filter(([id]) => id.startsWith('CR-'))
  const setrika = Object.entries(SKEMA_KEUANGAN).filter(([id]) => id.startsWith('S-'))
  const cleaning = Object.entries(SKEMA_KEUANGAN).filter(([id]) => id.startsWith('C-'))

  // Logika Visibilitas Slot Paddock
  const showPaddockSlot = selectedService === '' || selectedService.startsWith('CP-') || selectedService.startsWith('CR-')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-800">Beranda Klien</h1>
        <p className="text-slate-500 mt-1">Pesan layanan kebersihan, setrika, atau cuci kendaraan profesional sekarang.</p>
      </div>
      
      {status.type === 'success' && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start gap-4">
          <CheckCircle2 className="shrink-0 mt-0.5 text-emerald-600" size={24} />
          <div>
            <h3 className="font-bold text-lg">Pesanan Terkonfirmasi!</h3>
            <p className="text-sm mt-1">{status.msg}</p>
          </div>
        </div>
      )}

      {status.type === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold">
          {status.msg}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 sm:p-8 text-white relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
           <h2 className="text-2xl font-bold flex items-center gap-2 relative z-10">
             <Zap size={24} className="text-yellow-400" /> Formulir Pesanan Baru
           </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pilihan Layanan dengan OptGroup */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Layanan Ahli</label>
              <select 
                name="service_id" 
                required 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full p-4 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all font-medium cursor-pointer"
              >
                <option value="">-- Silakan Pilih Jasa --</option>
                
                <optgroup label="🚘 Cuci Kendaraan (Di Paddock kerjaKU)">
                  {cuciPaddock.map(([id, skema]) => <option key={id} value={id}>{skema.nama} - Rp {skema.harga.toLocaleString('id-ID')}</option>)}
                </optgroup>
                
                <optgroup label="🏡 Cuci Kendaraan (Panggil ke Rumah)">
                  {cuciRumah.map(([id, skema]) => <option key={id} value={id}>{skema.nama} - Rp {skema.harga.toLocaleString('id-ID')}</option>)}
                </optgroup>
                
                <optgroup label="👔 Jasa Setrika Pakaian (Panggil ke Rumah)">
                  {setrika.map(([id, skema]) => <option key={id} value={id}>{skema.nama} - Rp {skema.harga.toLocaleString('id-ID')}</option>)}
                </optgroup>
                
                <optgroup label="✨ Cleaning Service (Panggil ke Rumah)">
                  {cleaning.map(([id, skema]) => <option key={id} value={id}>{skema.nama} - Rp {skema.harga.toLocaleString('id-ID')}</option>)}
                </optgroup>
              </select>
            </div>

            {/* Tanggal & Waktu */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Calendar size={16} className="text-slate-400"/> Tanggal Kedatangan</label>
              <input type="date" name="schedule_date" required min={today} className="w-full p-4 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all font-medium" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Clock size={16} className="text-slate-400"/> Slot Waktu</label>
              <select name="schedule_slot" required className="w-full p-4 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all font-medium cursor-pointer">
                <option value="">-- Pilih Slot --</option>
                <option value="PAGI (08:00 - 12:00)">PAGI (08:00 - 12:00)</option>
                <option value="SIANG (13:00 - 17:00)">SIANG (13:00 - 17:00)</option>
                {/* Kondisional Paddock Slot */}
                {showPaddockSlot && (
                  <option value="KUNJUNGAN PADDOCK (Bebas)">KUNJUNGAN PADDOCK (Jam Operasional)</option>
                )}
              </select>
            </div>

            {/* Alamat Detail */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><MapPin size={16} className="text-slate-400"/> Alamat Lengkap (Kosongkan jika kunjungan Paddock)</label>
              <textarea name="address_detail" required rows={3} className="w-full p-4 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all resize-none font-medium" placeholder="Contoh: Jl. Zebra 2. Jika Anda memilih Cuci Paddock, cukup ketik: 'Datang ke Paddock'." ></textarea>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98] disabled:bg-slate-400 disabled:active:scale-100 flex justify-center items-center gap-2 text-lg">
              {loading ? <><Loader2 className="animate-spin" size={24} /> Memproses...</> : "Pesan Ahlinya Sekarang"}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4 font-medium">Dengan menekan tombol pesan, Anda menyetujui standar tarif yang berlaku.</p>
          </div>
        </form>
      </div>
    </div>
  )
}

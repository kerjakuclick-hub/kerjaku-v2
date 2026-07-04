#!/bin/bash

echo "🚀 [SPRINT 5] Membangun Modul Pemesanan & Finance Engine Backend..."
echo "======================================================================="

mkdir -p features/finance/services
mkdir -p features/order/services

# 1. GENERATE: Finance Engine (Centralized Pricing Logic)
echo "🧮 1. Membuat Finance Engine Backend (features/finance/services/financeEngine.ts)..."
cat << 'EOF' > features/finance/services/financeEngine.ts
// Arsitektur Keuangan kerjaKU.click
// Berjalan murni di Server untuk mencegah manipulasi harga dari Klien

export const SKEMA_KEUANGAN: Record<string, any> = {
  // SETRIKAKU
  'S-FAST': { nama: 'Jasa Setrika (2 Jam)', harga: 65000, fee: 9750, tech: 3000, bahan: 2500, isDual: false },
  'S-PRO': { nama: 'Jasa Setrika (3 Jam)', harga: 100000, fee: 15000, tech: 3000, bahan: 5000, isDual: false },
  'S-MAX': { nama: 'Jasa Setrika (Sepuasnya)', harga: 350000, fee: 52500, tech: 3000, bahan: 15000, isDual: true },
  // CLEANINGKU
  'C-FAST': { nama: 'Cleaning Service (2 Jam)', harga: 95000, fee: 14250, tech: 3000, bahan: 23000, isDual: false },
  'C-PRO': { nama: 'Cleaning Service (3 Jam)', harga: 125000, fee: 16250, tech: 3000, bahan: 23000, isDual: false },
};

export const getHargaLayanan = (paketId: string): number => {
  const skema = SKEMA_KEUANGAN[paketId];
  if (!skema) throw new Error("Paket layanan tidak ditemukan atau tidak valid.");
  return skema.harga;
};
EOF

# 2. GENERATE: Order Server Actions
echo "🔒 2. Membuat Order Server Actions (features/order/services/order-actions.ts)..."
cat << 'EOF' > features/order/services/order-actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { getHargaLayanan } from '@/features/finance/services/financeEngine'
import { revalidatePath } from 'next/cache'

export async function createOrder(formData: FormData) {
  try {
    const supabase = await createClient()
    
    // 1. Verifikasi User Session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Sesi tidak valid. Silakan login kembali.")

    // 2. Ambil data dari formulir
    const service_id = formData.get('service_id') as string
    const schedule_date = formData.get('schedule_date') as string
    const schedule_slot = formData.get('schedule_slot') as string
    const address_detail = formData.get('address_detail') as string

    // 3. VALIDASI BACKEND (Krusial: Menghitung harga di server, bukan mengambil dari input Klien)
    const calculated_price = getHargaLayanan(service_id)

    // 4. Masukkan ke Database Supabase
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

    if (error) throw new Error(`Database Error: ${error.message}`)

    // Refresh halaman agar data terbaru termuat (jika ada tabel riwayat)
    revalidatePath('/app/customer')
    
    return { success: true, message: "Pesanan berhasil dibuat! Ksatria kami akan segera ditugaskan." }
    
  } catch (error: any) {
    return { success: false, message: error.message || "Terjadi kesalahan internal." }
  }
}
EOF

# 3. GENERATE: Customer Dashboard dengan Interactive Form
echo "👤 3. Mengupdate Beranda Klien dengan Form Pemesanan (app/app/customer/page.tsx)..."
cat << 'EOF' > app/app/customer/page.tsx
'use client'

import { useState } from 'react'
import { Zap, CheckCircle2, Loader2, Calendar, MapPin, Clock } from 'lucide-react'
import { SKEMA_KEUANGAN } from '@/features/finance/services/financeEngine'
import { createOrder } from '@/features/order/services/order-actions'

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: null, msg: '' })

    const formData = new FormData(e.currentTarget)
    
    // Panggil Server Action
    const result = await createOrder(formData)

    if (result.success) {
      setStatus({ type: 'success', msg: result.message })
      ;(e.target as HTMLFormElement).reset() // Kosongkan form
    } else {
      setStatus({ type: 'error', msg: result.message })
    }
    
    setLoading(false)
  }

  // Generate tanggal minimal hari ini untuk input date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-800">Beranda Klien</h1>
        <p className="text-slate-500 mt-1">Pesan layanan kebersihan atau jasa setrika profesional ke rumah Anda.</p>
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
            
            {/* Pilihan Layanan */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Layanan</label>
              <select 
                name="service_id" 
                required 
                className="w-full p-4 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all appearance-none font-medium"
              >
                <option value="">-- Silakan Pilih Kategori Jasa --</option>
                {Object.entries(SKEMA_KEUANGAN).map(([id, skema]) => (
                  <option key={id} value={id}>
                    {skema.nama} - Rp {skema.harga.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal & Waktu */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-slate-400"/> Tanggal Kedatangan
              </label>
              <input 
                type="date" 
                name="schedule_date" 
                required 
                min={today}
                className="w-full p-4 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all font-medium" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-slate-400"/> Slot Waktu
              </label>
              <select 
                name="schedule_slot" 
                required 
                className="w-full p-4 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all appearance-none font-medium"
              >
                <option value="">-- Pilih Slot --</option>
                <option value="PAGI (08:00 - 12:00)">PAGI (08:00 - 12:00)</option>
                <option value="SIANG (13:00 - 17:00)">SIANG (13:00 - 17:00)</option>
              </select>
            </div>

            {/* Alamat Detail */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-slate-400"/> Alamat Lengkap (Area Palu)
              </label>
              <textarea 
                name="address_detail" 
                required 
                rows={3} 
                className="w-full p-4 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all resize-none font-medium" 
                placeholder="Contoh: Jl. Zebra 2, Rumah warna putih pagar hitam. Titik Google Maps menyusul via WA."
              ></textarea>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98] disabled:bg-slate-400 disabled:active:scale-100 flex justify-center items-center gap-2 text-lg"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={24} /> Memproses...</>
              ) : (
                "Pesan Ahlinya Sekarang"
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4 font-medium">
              Dengan menekan tombol pesan, Anda menyetujui standar tarif yang berlaku.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
EOF


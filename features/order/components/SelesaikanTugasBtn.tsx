'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { selesaikanTugas } from '@/features/order/services/ksatria-actions'

export function SelesaikanTugasBtn({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)

  const handleSelesai = async () => {
    // Cegah double-click
    if (loading) return; 
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('order_id', orderId)
      
      // Panggil aksi server
      const result = await selesaikanTugas(formData)
      
      if (result.success) {
        alert("🎉 Tugas Selesai! Pendapatan bersih telah masuk ke dompet Anda.")
        // Refresh halaman otomatis agar saldo terupdate di layar
        window.location.reload(); 
      } else {
        alert("❌ Sistem Menolak: " + result.message)
      }
    } catch (error: any) {
        alert("❌ Terjadi kesalahan jaringan: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleSelesai}
      disabled={loading}
      className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
      {loading ? "Memproses..." : "Tandai Selesai Kerja"}
    </button>
  )
}

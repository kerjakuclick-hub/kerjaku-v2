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

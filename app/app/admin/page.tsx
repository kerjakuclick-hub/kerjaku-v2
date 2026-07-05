import { getSemuaPesanan, getDaftarKsatria } from '@/features/order/services/order-queries'
import { assignKsatria } from '@/features/order/services/order-actions'
import { getBukuKas, getPendingWithdrawals } from '@/features/finance/services/finance-queries'
import { setujuiTarikTunai, tolakTarikTunai } from '@/features/finance/services/withdrawal-actions'
import { SKEMA_KEUANGAN } from '@/features/finance/services/financeEngine'
import { Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle, Landmark, ArrowUpRight, Banknote, Check, X } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function AdminDashboard() {
  const semuaPesanan = await getSemuaPesanan()
  const daftarKsatria = await getDaftarKsatria() 
  const bukuKas = await getBukuKas()
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
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pesanan Aktif</p>
           <p className="text-4xl font-black text-slate-800 mt-2">{pesananAktif}</p>
         </div>
         <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-emerald-600">Total Transaksi</p>
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

      {/* ANTREAN PENARIKAN DANA */}
      {withdrawals.length > 0 && (
        <div className="bg-red-50 rounded-3xl shadow-sm border border-red-200 overflow-hidden mt-8">
          <div className="p-6 border-b border-red-100 flex justify-between items-center bg-red-100/50">
            <h2 className="text-lg font-black text-red-800 flex items-center gap-2">
              <Banknote size={20} /> Antrean Pencairan Dana
            </h2>
            <span className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-full">{withdrawals.length} Permintaan</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-red-50 text-red-800 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-red-100">Ksatria</th>
                  <th className="p-4 font-bold border-b border-red-100">Tujuan Transfer</th>
                  <th className="p-4 font-bold border-b border-red-100 text-right">Nominal</th>
                  <th className="p-4 font-bold border-b border-red-100 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {withdrawals.map((w: any) => (
                  <tr key={w.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{w.ksatria?.full_name}</p>
                      <p className="text-xs text-slate-500">{w.ksatria?.phone_number}</p>
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
                        {/* BYPASS 1: Tolak Tarik Tunai */}
                        <form action={async (formData) => { 'use server'; await tolakTarikTunai(formData); }}>
                          <input type="hidden" name="id" value={w.id} />
                          <button type="submit" className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all shadow-sm"><X size={18} /></button>
                        </form>
                        {/* BYPASS 2: Setujui Tarik Tunai */}
                        <form action={async (formData) => { 'use server'; await setujuiTarikTunai(formData); }}>
                          <input type="hidden" name="id" value={w.id} />
                          <button type="submit" className="px-4 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                             <Check size={18} /> Sudah Ditransfer
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RADAR PESANAN */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Radar Pesanan Masuk</h2>
          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{daftarKsatria.length} Ksatria Aktif</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-slate-100">Klien</th>
                <th className="p-4 font-bold border-b border-slate-100">Layanan</th>
                <th className="p-4 font-bold border-b border-slate-100">Alamat</th>
                <th className="p-4 font-bold border-b border-slate-100">Status</th>
                <th className="p-4 font-bold border-b border-slate-100 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {semuaPesanan.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Kosong.</td></tr>
              ) : (
                semuaPesanan.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50">
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
                      {order.status === 'PENDING' ? (
                        <form action={async (formData) => { 'use server'; await assignKsatria(formData); }} className="flex flex-wrap items-center gap-2 justify-end">
                          {/* BYPASS 3: Assign Ksatria */}
                          <input type="hidden" name="order_id" value={order.id} />
                          <select name="ksatria_id" required className="p-2.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm cursor-pointer">
                            <option value="">-- Pilih Ksatria --</option>
                            {daftarKsatria.map((k: any) => (
                              <option key={k.id} value={k.id}>{k.full_name}</option>
                            ))}
                          </select>
                          <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-lg active:scale-95">
                            Tugaskan!
                          </button>
                        </form>
                      ) : (
                         <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Terkunci</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BUKU KAS */}
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
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Kosong.</td></tr>
              ) : (
                bukuKas.map((kas) => (
                  <tr key={kas.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-700">{getCategoryLabel(kas.category)}</td>
                    <td className="p-4 text-slate-600">{kas.description}</td>
                    <td className="p-4 text-slate-500 text-xs">{new Date(kas.created_at).toLocaleString('id-ID')}</td>
                    <td className="p-4 text-right font-black text-emerald-600">+ Rp {Number(kas.amount).toLocaleString('id-ID')}</td>
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

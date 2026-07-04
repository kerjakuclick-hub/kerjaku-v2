"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';
import { CheckCircle2, Camera, User, MapPin, ShieldCheck, Star } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function InvoicePage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [mitra, setMitra] = useState<any>(null);
  const [mitra2, setMitra2] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      // Ambil data pesanan
      const { data: oData, error: oError } = await supabase.from('pesanan').select('*').eq('id', params.id).single();
      
      if (oError || !oData) { setErrorMsg("Nota Tidak Ditemukan."); setLoading(false); return; }
      setOrder(oData);

      // Ambil Ksatria Utama
      if (oData.mitra_id) {
         const { data: m1 } = await supabase.from('mitra').select('nama_lengkap, foto_url').eq('id', oData.mitra_id).single();
         if (m1) setMitra(m1);
      }
      // Ambil Ksatria Pendamping (Jika Ada)
      if (oData.mitra_id_2) {
         const { data: m2 } = await supabase.from('mitra').select('nama_lengkap, foto_url').eq('id', oData.mitra_id_2).single();
         if (m2) setMitra2(m2);
      }
      setLoading(false);
    };
    fetchInvoice();
  }, [params.id]);

  if (loading) return <div className="p-10 text-center font-black animate-pulse text-slate-900">Memuat Profil Ksatria & E-Nota...</div>;
  if (errorMsg) return <div className="p-10 text-center font-black text-red-500 bg-red-50 rounded-2xl">{errorMsg}</div>;

  return (
     <div className="min-h-screen bg-slate-100 p-4 flex justify-center items-start pt-8 font-sans text-slate-900 pb-12">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-200">
           
           {/* HEADER */}
           <div className="bg-[#0f172a] py-5 px-6 flex justify-between items-center text-white border-b-4 border-blue-600">
              <div className="text-2xl font-black italic">kerjaKU<span className="text-blue-500">.click</span></div>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 text-blue-400">ID Ksatria</p>
           </div>
           
           <div className="p-6">
              
              {/* --- BAGIAN PROFIL ID CARD KSATRIA (SESUAI GAMBAR 2) --- */}
              <div className="flex flex-col items-center mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 relative shadow-sm">
                 
                 {/* FOTO BESAR KSATRIA (TIDAK AKAN TUMPANG TINDIH) */}
                 <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4 bg-slate-200">
                     {mitra?.foto_url ? (
                         <img src={mitra.foto_url} className="w-full h-full object-cover" alt="Foto Mitra" />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-blue-600">
                             <User size={40} />
                         </div>
                     )}
                 </div>

                 {/* INFORMASI NAMA DAN RATING */}
                 <div className="text-center space-y-1 mb-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ksatria Bertugas</p>
                     <h2 className="text-xl font-black text-slate-900 uppercase">{mitra?.nama_lengkap || 'Tim kerjaKU'}</h2>
                     <div className="flex items-center justify-center gap-1 text-orange-500">
                         <Star size={14} fill="currentColor" />
                         <span className="text-xs font-bold text-slate-700">4.9 / 5.0 (Review Klien)</span>
                     </div>
                 </div>

                 {/* BADGE MITRA TERVERIFIKASI (TIDAK TUMPANG TINDIH KARENA DI BAWAH FOTO) */}
                 <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 px-4 py-2 rounded-full">
                     <ShieldCheck size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Mitra Terverifikasi</span>
                 </div>

                 {/* Jika ada Ksatria Ke-2 */}
                 {mitra2 && (
                     <div className="mt-4 pt-4 border-t border-slate-200 w-full text-center">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Didampingi Oleh:</p>
                         <div className="flex items-center justify-center gap-2">
                             {mitra2.foto_url ? <img src={mitra2.foto_url} className="w-8 h-8 rounded-full object-cover shadow-sm"/> : <div className="w-8 h-8 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full font-black text-xs">{mitra2.nama_lengkap.charAt(0)}</div>}
                             <p className="font-bold text-xs text-slate-700 uppercase">{mitra2.nama_lengkap}</p>
                         </div>
                     </div>
                 )}
              </div>
              
              {/* --- BAGIAN DETAIL PESANAN & TRANSAKSI --- */}
              <div className="space-y-6">
                 
                 <div className="flex items-center gap-3">
                    <CheckCircle2 size={32} className="text-green-500" />
                    <div>
                        <h2 className="text-base font-black text-slate-900 uppercase">Tugas Selesai</h2>
                        <p className="text-[10px] font-bold text-slate-500">{new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                    </div>
                 </div>
                 
                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Layanan Pekerjaan</p><p className="font-extrabold text-sm text-blue-700 uppercase">{order.layanan}</p></div>
                    
                    <div className="border-t border-slate-200 pt-3"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1"><User size={12}/> Penerima Jasa</p><p className="font-extrabold text-sm text-slate-900">{order.nama_klien}</p></div>
                    
                    <div className="border-t border-slate-200 pt-3"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1"><MapPin size={12}/> Lokasi Kerja</p><p className="font-extrabold text-xs text-slate-900 leading-relaxed">{order.alamat_detail}</p></div>
                 </div>

                 <div className="flex justify-between items-center py-4 border-y border-dashed border-slate-300 bg-white">
                    <p className="font-black text-slate-500 uppercase text-xs tracking-widest">Total Bayar</p>
                    <p className="text-2xl font-black text-blue-600">Rp {order.total_bayar?.toLocaleString('id-ID')}</p>
                 </div>

                 {order.kode_promo && (
                     <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-center">
                         <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Promo Digunakan</p>
                         <p className="font-extrabold text-xs text-orange-700">{order.kode_promo}</p>
                     </div>
                 )}

                 {/* TAMPILAN FOTO SOP UNTUK KLIEN */}
                 {(order.foto_sebelum || order.foto_sesudah) && (
                    <div className="space-y-3 pt-2">
                       <p className="text-xs font-black text-slate-900 uppercase flex items-center gap-1 justify-center tracking-widest"><Camera size={14}/> Bukti Pekerjaan SOP</p>
                       <div className="grid grid-cols-2 gap-3">
                          {order.foto_sebelum ? (
                             <div className="border border-slate-200 rounded-xl p-2 bg-slate-50"><p className="text-[9px] font-black text-orange-600 mb-2 text-center uppercase tracking-widest">Kondisi Awal</p><a href={order.foto_sebelum} target="_blank"><img src={order.foto_sebelum} className="w-full h-28 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity"/></a></div>
                          ) : <div className="border border-dashed border-slate-300 rounded-xl p-2 flex items-center justify-center text-[9px] font-bold text-slate-400 text-center h-full min-h-[100px]">Foto Awal<br/>Belum Diupload</div>}
                          
                          {order.foto_sesudah ? (
                             <div className="border border-slate-200 rounded-xl p-2 bg-slate-50"><p className="text-[9px] font-black text-green-600 mb-2 text-center uppercase tracking-widest">Hasil Akhir</p><a href={order.foto_sesudah} target="_blank"><img src={order.foto_sesudah} className="w-full h-28 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity"/></a></div>
                          ) : <div className="border border-dashed border-slate-300 rounded-xl p-2 flex items-center justify-center text-[9px] font-bold text-slate-400 text-center h-full min-h-[100px]">Foto Akhir<br/>Belum Diupload</div>}
                       </div>
                    </div>
                 )}

                 <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest mt-8 pt-6 border-t border-slate-100">
                    Terima kasih telah menggunakan layanan kerjaKU.click.<br/>ID Card & Nota ini adalah bukti layanan resmi.
                 </p>
              </div>
           </div>
        </div>
     </div>
  );
}
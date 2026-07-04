"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShieldCheck, UserSquare2 } from 'lucide-react';
import { useParams } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function PublicIdCard() {
  const params = useParams();
  const id = params?.id as string;
  const [mitra, setMitra] = useState<any>(null);

  useEffect(() => { 
    if (id) {
        supabase.from('mitra').select('*').eq('id', id).single().then(({data}) => setMitra(data)); 
    }
  }, [id]);

  if (!mitra) return <div className="min-h-screen bg-[#0b1b36] flex justify-center items-center font-black text-white italic animate-pulse">Memverifikasi Data Ksatria...</div>;

  return (
    <div className="min-h-screen bg-[#0b1b36] flex justify-center items-center p-6 font-sans">
      
      {/* Container Utama Kartu ID */}
      <div className="w-full max-w-sm rounded-[2rem] shadow-2xl relative overflow-hidden bg-white">
         
         {/* Bagian Header (Gelap) */}
         {/* UPDATE: pb-32 memberikan ruang ekstra lebar di bawah teks agar aman dari foto */}
         <div className="bg-[#0b1b36] p-6 text-center text-white pb-32">
            <h2 className="text-3xl font-black italic tracking-tighter">kerjaKU</h2>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-green-400 text-[10px] uppercase font-black tracking-widest">
               <ShieldCheck size={14} strokeWidth={2.5}/> KSATRIA TERVERIFIKASI
            </div>
         </div>
         
         {/* Bagian Body (Putih) melengkung ke atas menimpa Header */}
         <div className="bg-white p-8 text-center rounded-t-[2rem] -mt-10 relative z-10 flex flex-col items-center">
            
            {/* Foto Ksatria (Tarik ke atas dengan -mt-24, sekarang aman!) */}
            <div className="w-32 h-32 bg-slate-100 rounded-full border-[5px] border-[#ea580c] mb-4 flex items-center justify-center overflow-hidden shadow-xl -mt-24 relative z-20">
               {mitra.foto_url ? (
                   <img src={mitra.foto_url} alt="Foto" className="w-full h-full object-cover" />
               ) : (
                   <UserSquare2 size={64} className="text-slate-300"/>
               )}
            </div>
            
            {/* Detail Ksatria */}
            <h3 className="text-2xl font-black text-slate-900 leading-tight mb-1">{mitra.nama_lengkap}</h3>
            <p className="text-sm font-black text-[#ea580c] uppercase tracking-widest mb-6">{mitra.keahlian}</p>
            
            {/* Kotak Status Resmi */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl w-full text-left space-y-3 shadow-sm">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Status</p>
                  <p className="text-sm font-black text-green-600 flex items-center gap-1.5">
                      <ShieldCheck size={16} strokeWidth={2.5}/> AKTIF RESMI
                  </p>
               </div>
               <div className="border-t border-slate-100 pt-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Platform</p>
                  <p className="text-sm font-black text-slate-900">PT. Kerjaku Bangun Negeri</p>
               </div>
            </div>
            
         </div>
      </div>
    </div>
  );
}
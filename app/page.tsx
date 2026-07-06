import React from 'react';
import { ShieldAlert, MessageCircle, Instagram, Wrench } from 'lucide-react';

export const dynamic = "force-dynamic";

export default function MaintenancePage() {
  const NOMOR_WA_CS = "6281145504178";
  const INSTAGRAM_URL = "https://instagram.com/kerjaku.click"; // Sesuaikan dengan username IG Anda

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col justify-between items-center px-6 py-12" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* HEADER LOGO */}
      <header className="w-full max-w-md mx-auto text-center pt-8">
        <div className="text-2xl font-black tracking-tighter italic">
          kerjaKU<span className="text-blue-500">.click</span>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="max-w-md mx-auto text-center space-y-6 my-auto flex flex-col items-center">
        <div className="w-20 h-20 bg-blue-600/10 border-2 border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center animate-pulse mb-2">
          <Wrench size={40} />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
          Peningkatan Standar Layanan
        </h1>
        
        <p className="text-sm text-slate-400 leading-relaxed text-justify sm:text-center">
          Halo Warga Palu, saat ini kami sedang melakukan **pemeliharaan sistem dan restrukturisasi fundamental logika platform** untuk menghadirkan pengalaman pemesanan yang jauh lebih stabil, presisi, dan aman.
        </p>

        <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-left w-full flex gap-3 items-start">
          <ShieldAlert className="text-amber-400 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-slate-300 leading-relaxed">
            Seluruh pesanan retail dihentikan sementara di aplikasi web. Manajemen kami sedang merapikan standarisasi SOP operasional demi kenyamanan Klien dan Ksatria (Mitra) kami ke depan.
          </p>
        </div>

        {/* TOMBOL PENGALIHAN MANUAL */}
        <div className="w-full space-y-3 pt-4">
          <a 
            href={`https://wa.me/${NOMOR_WA_CS}?text=Halo%20Admin%20kerjaKU,%20saya%20ingin%20bertanya%20mengenai%20layanan`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-sm transition-all hover:bg-blue-500 flex justify-center items-center gap-2 shadow-lg shadow-blue-900/40"
          >
            <MessageCircle size={18} />
            Hubungi Layanan via WhatsApp
          </a>

          <a 
            href={INSTAGRAM_URL}
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full bg-slate-800 border border-slate-700 text-slate-300 font-bold py-4 rounded-xl text-sm transition-all hover:bg-slate-700 flex justify-center items-center gap-2"
          >
            <Instagram size={18} />
            Pantau Update di Instagram Resmi
          </a>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-md mx-auto text-center pt-8 border-t border-slate-800">
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
          PT. Kerjaku Bangun Negeri — Kota Palu
        </p>
      </footer>

    </div>
  );
}
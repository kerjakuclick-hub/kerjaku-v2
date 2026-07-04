import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Star, Car, Shirt, Sparkles, ArrowRight, MapPin, Building2, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'kerjaKU.click - Solusi Urusan Rumah di Palu',
  description: 'Layanan Jasa Cuci Kendaraan, Setrika, dan Cleaning Service Profesional di Kota Palu.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      
      {/* NAVBAR */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-1 italic">
            <span className="text-2xl font-black text-blue-600">kerjaKU</span>
            <span className="text-2xl font-light text-slate-400">.click</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              <MapPin size={14} className="text-red-500"/> Kota Palu
            </span>
            <Link href="/login" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95">
              Masuk / Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="pt-32 pb-16 md:pt-40 md:pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-bold text-sm border border-blue-100">
            <Sparkles size={16} /> Era Baru Layanan Jasa di Palu
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Urusan Rumah & Kendaraan, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 italic">
              Sekali Klik Beres!
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
            Tinggalkan cara lama. Pesan layanan Cuci Kendaraan, Setrika, dan Cleaning Service dengan Ksatria terlatih dan tersertifikasi dari Paddock kerjaKU.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-black text-lg rounded-full hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 hover:-translate-y-1">
              Pesan Ahlinya Sekarang <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </main>

      {/* PILAR LAYANAN */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-800">4 Pilar Layanan Unggulan</h2>
            <p className="text-slate-500 mt-2 font-medium">Harga transparan, hasil maksimal.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Kartu 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Cuci Paddock</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">Datang langsung ke markas kami. Fasilitas lengkap, ruang tunggu nyaman, hasil cucian detail.</p>
              <p className="text-blue-600 font-black text-lg">Mulai Rp 20rb</p>
            </div>
            
            {/* Kartu 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Car size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Cuci Panggilan</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">Mager keluar rumah? Ksatria kami akan datang mencuci motor/mobil langsung di garasi Anda.</p>
              <p className="text-emerald-600 font-black text-lg">Mulai Rp 35rb</p>
            </div>

            {/* Kartu 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shirt size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">SetrikaKU</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">Pakaian menumpuk? Kami setrika rapi dan wangi. Terdapat pilihan Fast (1.5 Jam) dan Pro (2.5 Jam).</p>
              <p className="text-orange-600 font-black text-lg">Mulai Rp 65rb</p>
            </div>

            {/* Kartu 4 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">CleaningKU</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">Jasa pembersihan rumah profesional. Ksatria datang membawa standar bahan pembersih khusus.</p>
              <p className="text-purple-600 font-black text-lg">Mulai Rp 85rb</p>
            </div>
          </div>
        </div>
      </section>

      {/* PADDOCK HIGHLIGHT */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black leading-tight">Bukan Sekadar Aplikasi. <br/><span className="text-blue-400 italic">Kami Punya "PADDOCK".</span></h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Berbeda dengan aplikasi lain, kerjaKU memiliki fasilitas fisik berupa <b>PADDOCK</b> di Palu. Ini adalah pusat layanan cuci kendaraan sekaligus kawah candradimuka tempat para calon Ksatria dilatih dan disertifikasi sebelum melayani Anda.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-200"><CheckCircle2 className="text-emerald-400" /> Ksatria terverifikasi KTP & Latar Belakang</li>
                <li className="flex items-center gap-3 text-slate-200"><CheckCircle2 className="text-emerald-400" /> Dilatih standar operasional kebersihan tinggi</li>
                <li className="flex items-center gap-3 text-slate-200"><CheckCircle2 className="text-emerald-400" /> Kualitas bahan & kimia tersertifikasi kerjaKU</li>
              </ul>
              <div className="pt-4">
                <Link href="/login" className="inline-flex px-8 py-4 bg-white text-slate-900 font-black text-lg rounded-full hover:bg-blue-50 transition-all flex-center gap-2">
                  Buktikan Kualitas Kami Sekarang
                </Link>
              </div>
            </div>
            
            {/* Visual Represenation */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-tr from-slate-800 to-slate-700 rounded-[3rem] border border-slate-600 shadow-2xl flex items-center justify-center p-8">
                 <div className="text-center space-y-6">
                    <ShieldCheck size={100} className="mx-auto text-blue-400 opacity-80" />
                    <h3 className="text-2xl font-bold">100% Ksatria Terlatih</h3>
                    <div className="flex justify-center gap-2 text-yellow-400">
                      <Star fill="currentColor" size={24} />
                      <Star fill="currentColor" size={24} />
                      <Star fill="currentColor" size={24} />
                      <Star fill="currentColor" size={24} />
                      <Star fill="currentColor" size={24} />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-black text-blue-600 italic mb-4">kerjaKU<span className="text-slate-800">.click</span></h2>
          <p className="text-slate-500 text-sm font-medium">© 2026 PT Logic Institute - Menggerakkan Ekonomi Warga Palu.</p>
        </div>
      </footer>

    </div>
  );
}

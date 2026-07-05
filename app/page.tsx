"use client";

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Loader2, MapPin, Car, Shirt, Sparkles, Clock, ArrowRight } from 'lucide-react';

export default function LandingPageMVP() {
  const [formData, setFormData] = useState({
    nama_klien: '',
    no_wa_klien: '',
    layanan: '',
    alamat_detail: '',
    slot_waktu: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: '' });

    try {
      // Mengirim data ke API Fonnte lokal Anda (V1)
      const res = await fetch('/api/send-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setStatus({ type: 'success', msg: '✅ Pesanan Terkirim! Admin kerjaKU akan segera membalas WhatsApp Anda.' });
        setFormData({ nama_klien: '', no_wa_klien: '', layanan: '', alamat_detail: '', slot_waktu: '' });
      } else {
        throw new Error('Gagal');
      }
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ Gagal mengirim pesanan. Silakan hubungi WA admin secara manual.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200" style={{ scrollBehavior: 'smooth' }}>
      
      {/* NAVBAR */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-1 italic">
            <span className="text-2xl font-black text-blue-800">kerjaKU</span>
            <span className="text-2xl font-light text-blue-600">.click</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="#form-pesan" className="hidden md:flex bg-blue-800 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition-colors">
              Pesan Sekarang
            </a>
            <div className="md:hidden flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <MapPin size={16} className="text-red-500" />
              <span className="text-xs font-bold text-slate-600">Palu</span>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION (Mengikuti Desain Banner Biru) */}
      <div className="bg-blue-800 text-white pt-16 pb-24 px-6 relative overflow-hidden">
        {/* Ornamen Latar */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
            <span className="text-yellow-400">SEKALI KLIK!</span><br/>
            Berbagai Pekerjaan Rumah Terselesaikan.
          </h1>
          <p className="text-lg md:text-xl text-blue-100 font-medium max-w-2xl mx-auto">
            Platform digital terpercaya penyedia tenaga ahli profesional terverifikasi untuk menyelesaikan berbagai urusan kerapian dan kebersihan tanpa ribet.
          </p>
          <div className="pt-4 flex justify-center gap-4">
             <a href="#form-pesan" className="bg-yellow-400 text-slate-900 px-8 py-4 rounded-full font-black text-lg hover:bg-yellow-300 hover:scale-105 transition-all shadow-lg shadow-yellow-400/20 flex items-center gap-2">
               Panggil Ksatria <ArrowRight size={20} />
             </a>
          </div>
        </div>
      </div>

      {/* PILIHAN LAYANAN (3 KOTAK) */}
      <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-20 h-20 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border-4 border-blue-100 mb-4">
              <Car size={36} />
            </div>
            <h3 className="text-xl font-black text-blue-800 mb-2">CUCI KENDARAAN</h3>
            <p className="text-sm text-slate-500 font-medium">Layanan Paddock & Panggilan ke Rumah.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-20 h-20 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border-4 border-blue-100 mb-4">
              <Sparkles size={36} />
            </div>
            <h3 className="text-xl font-black text-blue-800 mb-2">CLEANING HOME</h3>
            <p className="text-sm text-slate-500 font-medium">Pembersihan rumah cepat dan profesional.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-20 h-20 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border-4 border-blue-100 mb-4">
              <Shirt size={36} />
            </div>
            <h3 className="text-xl font-black text-blue-800 mb-2">SETRIKA PAKAIAN</h3>
            <p className="text-sm text-slate-500 font-medium">Pakaian rapi, wangi, siap pakai.</p>
          </div>

        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row gap-16 items-start" id="form-pesan">
        
        {/* KIRI: NILAI JUAL */}
        <div className="w-full lg:w-5/12 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-full font-bold text-sm tracking-widest uppercase">
            Cara Pesan Layanan Kami
          </div>
          <h2 className="text-4xl font-black text-blue-900 leading-tight">
            Duduk Manis, <br/>Biar Ksatria Kami Yang Bekerja.
          </h2>
          
          <div className="space-y-6 pt-4">
            <div className="flex gap-4 items-start">
              <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 mt-1"><ShieldCheck size={24} /></div>
              <div><p className="font-bold text-lg text-slate-800">Mitra Terverifikasi</p><p className="text-sm text-slate-500 mt-1">Semua Ksatria telah melalui proses seleksi ketat untuk memastikan kualitas, keamanan, dan kepercayaan Anda.</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 mt-1"><CheckCircle2 size={24} /></div>
              <div><p className="font-bold text-lg text-slate-800">Harga Transparan</p><p className="text-sm text-slate-500 mt-1">Harga yang Anda lihat adalah harga yang dibayar. Tidak ada biaya tersembunyi.</p></div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-amber-100 p-3 rounded-2xl text-amber-600 mt-1"><Clock size={24} /></div>
              <div><p className="font-bold text-lg text-slate-800">Jadwal Fleksibel</p><p className="text-sm text-slate-500 mt-1">Atur jadwal layanan sesuai kebutuhan Anda hari ini atau besok.</p></div>
            </div>
          </div>
        </div>

        {/* KANAN: FORMULIR PEMESANAN (PRODUK BARU) */}
        <div className="w-full lg:w-7/12">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <h3 className="text-2xl font-black mb-2 text-blue-900">Formulir Pemesanan</h3>
            <p className="text-slate-500 text-sm mb-8 pb-6 border-b border-slate-100">Isi data di bawah, pesanan akan langsung masuk ke WhatsApp Admin kerjaKU.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nama Lengkap</label>
                  <input type="text" name="nama_klien" required value={formData.nama_klien} onChange={handleChange} placeholder="Cth: Ibu Dewi" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">No. WhatsApp</label>
                  <input type="tel" name="no_wa_klien" required value={formData.no_wa_klien} onChange={handleChange} placeholder="Cth: 0812345..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all font-medium" />
                </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Pilih Layanan (Sesuai Kebutuhan)</label>
                 <select name="layanan" required value={formData.layanan} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-blue-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all cursor-pointer appearance-none">
                    <option value="">-- Ketuk untuk memilih jasa --</option>
                    
                    <optgroup label="🚘 CUCI KENDARAAN (Datang ke Paddock)">
                      <option value="Cuci Motor Kecil (Paddock) - Rp 20.000">Cuci Motor Kecil - Rp 20.000</option>
                      <option value="Cuci Motor Besar (Paddock) - Rp 25.000">Cuci Motor Besar - Rp 25.000</option>
                      <option value="Cuci Mobil Small (Paddock) - Rp 50.000">Cuci Mobil Small - Rp 50.000</option>
                      <option value="Cuci Mobil Medium (Paddock) - Rp 60.000">Cuci Mobil Medium - Rp 60.000</option>
                    </optgroup>

                    <optgroup label="🏡 CUCI KENDARAAN (Panggilan ke Rumah)">
                      <option value="Cuci Motor Kecil (Panggilan) - Rp 35.000">Cuci Motor Kecil - Rp 35.000</option>
                      <option value="Cuci Motor Besar (Panggilan) - Rp 45.000">Cuci Motor Besar - Rp 45.000</option>
                      <option value="Cuci Mobil Mini (Panggilan) - Rp 75.000">Cuci Mobil Mini - Rp 75.000</option>
                      <option value="Cuci Mobil Medium (Panggilan) - Rp 95.000">Cuci Mobil Medium - Rp 95.000</option>
                    </optgroup>

                    <optgroup label="👔 JASA SETRIKA PAKAIAN (Panggilan)">
                      <option value="Setrika FAST (1.5 Jam / 25 Pcs) - Rp 65.000">Setrika FAST (1.5 Jam / 25 Pcs) - Rp 65.000</option>
                      <option value="Setrika PRO (2.5 Jam / 40 Pcs) - Rp 95.000">Setrika PRO (2.5 Jam / 40 Pcs / Hibrid) - Rp 95.000</option>
                    </optgroup>

                    <optgroup label="✨ CLEANING HOME (Panggilan)">
                      <option value="Cleaning FAST (1.5 Jam) - Rp 85.000">Cleaning FAST (1.5 Jam) - Rp 85.000</option>
                      <option value="Cleaning PRO (2.5 Jam) - Rp 125.000">Cleaning PRO (2.5 Jam / Hibrid) - Rp 125.000</option>
                    </optgroup>
                 </select>
              </div>

              <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Waktu Kedatangan</label>
                  <select name="slot_waktu" required value={formData.slot_waktu} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all cursor-pointer appearance-none">
                    <option value="">-- Kapan Ksatria harus datang? --</option>
                    <option value="Hari Ini (Sesi Pagi: 08.00 - 12.00)">Hari Ini (Sesi Pagi)</option>
                    <option value="Hari Ini (Sesi Siang: 13.00 - 17.00)">Hari Ini (Sesi Siang)</option>
                    <option value="Besok (Bebas Atur Waktu)">Besok (Bebas Atur Waktu)</option>
                  </select>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Alamat Lengkap</label>
                 <textarea name="alamat_detail" required value={formData.alamat_detail} onChange={handleChange} placeholder="Detail alamat Anda. (Ketik 'Datang ke Paddock' jika memilih cuci di Paddock)" rows={3} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl resize-none outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"></textarea>
              </div>

              <button disabled={loading} type="submit" className="w-full bg-blue-800 text-white font-black py-5 rounded-2xl shadow-[0_10px_20px_-10px_rgba(30,64,175,0.6)] hover:bg-blue-900 active:scale-95 transition-all text-lg flex justify-center items-center gap-2 disabled:bg-slate-400 disabled:shadow-none mt-4">
                {loading ? <><Loader2 className="animate-spin" /> Memproses...</> : "Kirim Pesanan Sekarang"}
              </button>

              {status.type && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-start gap-3 mt-4 ${status.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" /> : null}
                  {status.msg}
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
      
      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
         <p>© 2026 PT. KERJAKU BANGUN NEGERI. All rights reserved.</p>
      </footer>
    </div>
  );
}
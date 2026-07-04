"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Menu, X, MapPin, ShieldCheck, Zap, CheckCircle2, 
  MessageCircle, UserPlus, Lock, MessageSquare, 
  LogOut, Shirt, Sparkles, Home as HomeIcon,
  CalendarDays, CircleDollarSign, Headset, ChevronRight,
  Mail, Camera, ArrowUpCircle, Star, Quote
} from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

const DAFTAR_PAKET = [
  { id: 'S-FAST', kategori: 'SETRIKA', nama: 'SETRIKA FAST', harga: 65000, deskripsi: 'Maks 30 Pcs | 1.5 Jam | 1 Ksatria', icon: <Zap size={24}/> },
  { id: 'S-PRO', kategori: 'SETRIKA', nama: 'SETRIKA PRO', harga: 100000, deskripsi: 'Maks 40 Pcs / Hibrid | 2.5 Jam | 1 Ksatria', icon: <Shirt size={24}/> },
  { id: 'S-MAX', kategori: 'SETRIKA', nama: 'SETRIKA MAX', harga: 350000, deskripsi: 'Maks 100 Pcs / Heavy Duty | 5 Jam | 2 Ksatria (Dual)', icon: <Sparkles size={24}/> },
  { id: 'C-FAST', kategori: 'CLEANING', nama: 'CLEANING FAST', harga: 75000, deskripsi: 'Tipe 36-45 | 1.5 Jam | 1 Ksatria', icon: <Zap size={24}/> },
  { id: 'C-PRO', kategori: 'CLEANING', nama: 'CLEANING PRO', harga: 100000, deskripsi: 'Tipe 50-100 / Hibrid | 2.5 Jam | 1 Ksatria', icon: <ShieldCheck size={24}/> },
  { id: 'C-MAX', kategori: 'CLEANING', nama: 'CLEANING MAX', harga: 350000, deskripsi: 'Heavy Duty / Pasca Pesta | 5 Jam | 2 Ksatria', icon: <Sparkles size={24}/> },
];

const DAFTAR_SLOT_WAKTU = [
  { value: '09:00', label: '09:00 - 11:00' },
  { value: '11:00', label: '11:00 - 13:00' },
  { value: '13:00', label: '13:00 - 15:00' },
  { value: '15:00', label: '15:00 - 17:00' }
];

// DATA DUMMY TESTIMONI WARGA PALU
const TESTIMONIALS = [
  {
    id: 1,
    nama: "Ibu Riska M.",
    alamat: "CitraLand Palu",
    foto: "https://i.pravatar.cc/150?img=47",
    teks: "Fitur special request-nya juara! Mbaknya gak cuma nyetrika, tapi juga bantu rapiin lipatan masuk ke lemari. Bener-bener ngebantu banget buat ibu pekerja."
  },
  {
    id: 2,
    nama: "Fadly Hidayat",
    alamat: "Jl. R.E. Martadinata",
    foto: "https://i.pravatar.cc/150?img=11",
    teks: "Habis acara kumpul keluarga rumah berantakan parah. Order paket Cleaning PRO, 2 jam langsung kinclong. Ksatria-nya sopan dan inisiatifnya tinggi."
  },
  {
    id: 3,
    nama: "Dr. Amanda T.",
    alamat: "Balaroa, Palu Barat",
    foto: "https://i.pravatar.cc/150?img=32",
    teks: "Saya stop pakai ART karena sering drama. Sekarang mending pakai kerjaKU seminggu 2x. Lebih murah, lebih profesional, barang-barang aman. Puas banget!"
  }
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [klienData, setKlienData] = useState<any>(null);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [authForm, setAuthForm] = useState({ nama: '', wa: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [tabLayanan, setTabLayanan] = useState<'SETRIKA' | 'CLEANING'>('SETRIKA');
  const [paketTerpilih, setPaketTerpilih] = useState(DAFTAR_PAKET[1]);

  const [alamat, setAlamat] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [availableSlots, setAvailableSlots] = useState(DAFTAR_SLOT_WAKTU);

  const [clientOrders, setClientOrders] = useState<any[]>([]);
  const [formTab, setFormTab] = useState<string>('pesan');
  
  const [orderToUpgrade, setOrderToUpgrade] = useState<any>(null);

  const NOMOR_WA_CS = "6281145504178";

  useEffect(() => {
    const savedKlien = localStorage.getItem('klien_data');
    if (savedKlien) { const parsed = JSON.parse(savedKlien); setKlienData(parsed); fetchClientOrders(parsed.no_wa); }
  }, []);

  useEffect(() => {
    if (!tanggal) return;
    const today = new Date();
    const selectedDate = new Date(tanggal);
    const isToday = selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear();

    if (isToday) {
      const currentHour = today.getHours();
      const filteredSlots = DAFTAR_SLOT_WAKTU.filter(slot => parseInt(slot.value.split(':')[0]) > currentHour);
      setAvailableSlots(filteredSlots);
      if (filteredSlots.length > 0) setJam(filteredSlots[0].value); else setJam('');
    } else {
      setAvailableSlots(DAFTAR_SLOT_WAKTU);
      setJam(DAFTAR_SLOT_WAKTU[0].value);
    }
  }, [tanggal]);

  const fetchClientOrders = async (phone: string) => {
    const { data } = await supabase.from('pesanan').select('*').eq('no_wa_klien', phone).order('created_at', { ascending: false });
    if (data) setClientOrders(data);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleCtaOrder = (kategori: 'SETRIKA' | 'CLEANING') => {
    scrollToSection('layer-2');
    if (klienData) {
        setFormTab('pesan');
        setTabLayanan(kategori);
        if (kategori === 'SETRIKA') setPaketTerpilih(DAFTAR_PAKET[1]);
        else setPaketTerpilih(DAFTAR_PAKET[4]);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    let cleanedWa = authForm.wa.replace(/\D/g, ''); if(cleanedWa.startsWith('0')) cleanedWa = '62' + cleanedWa.substring(1);
    if (isLoginMode) {
      const { data } = await supabase.from('klien').select('*').eq('no_wa', cleanedWa).eq('password', authForm.password).single();
      if (data) { setKlienData(data); localStorage.setItem('klien_data', JSON.stringify(data)); fetchClientOrders(data.no_wa); setFormTab('pesan'); scrollToSection('layer-2'); }
      else { alert('Nomor WA atau Password salah!'); }
    } else {
      const { data, error } = await supabase.from('klien').insert([{ nama_lengkap: authForm.nama, no_wa: cleanedWa, password: authForm.password }]).select().single();
      if (data) { setKlienData(data); localStorage.setItem('klien_data', JSON.stringify(data)); fetchClientOrders(data.no_wa); setFormTab('pesan'); scrollToSection('layer-2'); alert('Pendaftaran Berhasil!'); }
      else { alert('Gagal mendaftar. Nomor WA mungkin sudah terdaftar.'); }
    }
    setLoading(false);
  };

  const handleLogout = () => { localStorage.removeItem('klien_data'); setKlienData(null); setClientOrders([]); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!tanggal || !alamat) return alert('Lengkapi Alamat dan Tanggal!');
    if(!jam) return alert('Slot waktu untuk hari ini sudah habis!');
    setLoading(true);
    
    const hargaNormal = paketTerpilih.harga;
    const labelJam = DAFTAR_SLOT_WAKTU.find(s => s.value === jam)?.label || jam;
    const slotWaktuFormat = `${tanggal} | ${labelJam}`;
    
    const detailPekerjaan = (specialRequest && (paketTerpilih.id.includes('PRO') || paketTerpilih.id.includes('MAX'))) 
                            ? `${alamat} | (REQ HIBRID: ${specialRequest})` 
                            : alamat;
    
    const { error } = await supabase.from('pesanan').insert([{
      nama_klien: klienData.nama_lengkap, no_wa_klien: klienData.no_wa, alamat_detail: detailPekerjaan, 
      layanan: paketTerpilih.nama, paket_layanan: paketTerpilih.id, 
      slot_waktu: slotWaktuFormat, preferensi_gender: 'Bebas', status: 'pending', tipe_klien: 'retail',
      total_bayar: hargaNormal
    }]);

    if (!error) {
      setSuccess(true); fetchClientOrders(klienData.no_wa);
      setAlamat(''); setTanggal(''); setJam(''); setSpecialRequest('');
      setTimeout(() => { setSuccess(false); setFormTab('riwayat'); }, 4000);
    } else { alert(`GAGAL MEMESAN! Error: ${error.message}`); }
    setLoading(false);
  };

  const handleExecuteUpgrade = async (targetPaketId: string) => {
    if (!orderToUpgrade) return;
    setLoading(true);
    const paketBaru = DAFTAR_PAKET.find(p => p.id === targetPaketId);
    if (!paketBaru) return;

    const { error } = await supabase
      .from('pesanan')
      .update({
        paket_layanan: paketBaru.id,
        layanan: paketBaru.nama,
        total_bayar: paketBaru.harga,
        alamat_detail: `${orderToUpgrade.alamat_detail} (UPGRADED AT SITE TO ${paketBaru.nama})`
      })
      .eq('id', orderToUpgrade.id);

    if (!error) {
      alert(`Berhasil upgrade ke ${paketBaru.nama}! Silakan lakukan pembayaran selisihnya nanti.`);
      setOrderToUpgrade(null);
      fetchClientOrders(klienData.no_wa);
    } else {
      alert(`Gagal upgrade: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 🟢 FLOATING WHATSAPP CS */}
      <a href={`https://wa.me/${NOMOR_WA_CS}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center">
        <MessageCircle size={32} />
      </a>

      {/* --- LAYER 1: HEADER & HERO --- */}
      <nav className="fixed top-0 w-full z-[90] bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-md mx-auto px-6 h-20 flex justify-between items-center">
          <div className="text-2xl font-black tracking-tighter text-[#001b3d]">
            kerjaKU<span className="text-[#1800AD]">.click</span>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-[#1800AD] transition-colors hover:text-[#0081cc]">
            {isMenuOpen ? <X size={32}/> : <Menu size={32}/>}
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-white border-b shadow-2xl p-6 flex flex-col gap-4 animate-in slide-in-from-top max-w-md mx-auto right-0 z-[100]">
            <button onClick={() => scrollToSection('layer-1')} className="text-left font-bold py-3 border-b border-slate-50 uppercase tracking-widest text-xs text-[#001b3d]">Home</button>
            <button onClick={() => scrollToSection('layer-2')} className="text-left font-bold py-3 border-b border-slate-50 uppercase tracking-widest text-xs text-[#001b3d]">Akses Klien</button>
            <button onClick={() => scrollToSection('layer-3')} className="text-left font-bold py-3 uppercase tracking-widest text-xs text-[#001b3d]">Tentang Kami</button>
          </div>
        )}
      </nav>

      <section id="layer-1" className="pt-32 pb-16 px-6 max-w-md mx-auto flex flex-col items-start text-left">
        
        <div className="w-full space-y-3"> 
          <h1 className="text-[25px] min-[380px]:text-[28px] sm:text-[2.2rem] leading-[1.3] font-normal w-full tracking-wide text-slate-900">
            <span className="block">SOLUSI INSTAN</span>
            <span className="block">MASALAH PEKERJAAN</span>
            <span className="block">RUMAH TANGGA ANDA.</span>
          </h1>
          <h2 className="text-[25px] min-[380px]:text-[28px] sm:text-[2.2rem] leading-[1.3] font-black text-[#1800AD] uppercase underline decoration-[#1800AD] decoration-[3px] sm:decoration-4 underline-offset-[6px] mt-2 block">
            SEKALI KLIK BERES!
          </h2>
          
          <p className="text-[11px] sm:text-xs text-slate-700 font-normal leading-relaxed pt-4 pr-2 text-justify">
            Platform digital terpercaya penyedia tenaga & keahlian profesional terverifikasi untuk menyelesaikan berbagai urusan kerapian dan kebersihan rumah Anda tanpa ribet.
          </p>
        </div>

        <div className="w-full flex justify-start mt-8">
           <button 
             onClick={() => scrollToSection('layer-2')} 
             className="bg-[#1800AD] text-white font-bold py-3.5 px-10 rounded-xl text-sm shadow-xl shadow-blue-900/20 active:scale-95 transition-transform tracking-wide"
           >
             Pesan sekarang
           </button>
        </div>

        <div className="grid grid-cols-2 gap-5 mt-14 w-full">
          <div onClick={() => handleCtaOrder('SETRIKA')} className="flex flex-col rounded-2xl overflow-hidden cursor-pointer shadow-lg bg-white hover:-translate-y-1 transition-transform">
            <img src="/jasasetrika.png" alt="SetrikaKU" className="w-full aspect-square object-cover" />
            <div className="bg-[#004aad] py-4 text-center">
               <span className="text-white font-bold text-sm tracking-widest uppercase">SetrikaKU</span>
            </div>
          </div>
          <div onClick={() => handleCtaOrder('CLEANING')} className="flex flex-col rounded-2xl overflow-hidden cursor-pointer shadow-lg bg-white hover:-translate-y-1 transition-transform">
            <img src="/cleaninghome.png" alt="CleaningKU" className="w-full aspect-square object-cover" />
            <div className="bg-[#0081cc] py-4 text-center">
               <span className="text-white font-bold text-sm tracking-widest uppercase">CleaningKU</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-12 w-full pt-8 border-t border-slate-100">
          <div className="flex flex-col items-center text-center gap-3">
             <p className="text-[10px] font-bold text-slate-800 leading-tight h-8">Mitra<br/>Terverifikasi</p>
             <div className="text-[#0081cc] bg-blue-50 p-2 rounded-full"><ShieldCheck size={22} strokeWidth={2}/></div>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
             <p className="text-[10px] font-bold text-slate-800 leading-tight h-8">Jadwal<br/>Fleksibel</p>
             <div className="text-[#0081cc] bg-blue-50 p-2 rounded-full"><CalendarDays size={22} strokeWidth={2}/></div>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
             <p className="text-[10px] font-bold text-slate-800 leading-tight h-8">Harga<br/>Transparan</p>
             <div className="text-[#0081cc] bg-blue-50 p-2 rounded-full"><CircleDollarSign size={22} strokeWidth={2}/></div>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
             <p className="text-[10px] font-bold text-slate-800 leading-tight h-8">Special<br/>Request</p>
             <div className="text-[#0081cc] bg-blue-50 p-2 rounded-full"><Headset size={22} strokeWidth={2}/></div>
          </div>
        </div>

      </section>

      {/* --- LAYER 2: FORM & SYSTEM CORE --- */}
      <section id="layer-2" className="py-16 px-6 max-w-md mx-auto bg-slate-50 border-t border-slate-200 shadow-inner">
        
        <div className="w-full">
          {!klienData ? (
            <div className="bg-transparent">
               <div className="flex gap-2 mb-6">
                  <button onClick={() => setIsLoginMode(false)} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm ${!isLoginMode ? 'bg-[#1800AD] text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>Daftar Akun</button>
                  <button onClick={() => setIsLoginMode(true)} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm ${isLoginMode ? 'bg-[#1800AD] text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>Login</button>
               </div>

               <form onSubmit={handleAuth} className="p-8 border border-slate-200 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 space-y-5">
                  {!isLoginMode && (
                      <div>
                          <label className="block text-[11px] font-bold text-[#001b3d] mb-2 uppercase tracking-widest">Nama Lengkap*</label>
                          <input required value={authForm.nama} onChange={e=>setAuthForm({...authForm, nama: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 outline-none focus:border-[#1800AD] text-xs font-medium transition-colors" placeholder="Masukkan nama lengkap Anda" />
                      </div>
                  )}
                  <div>
                      <label className="block text-[11px] font-bold text-[#001b3d] mb-2 uppercase tracking-widest">Nomor Whatsapp*</label>
                      <input required type="tel" value={authForm.wa} onChange={e=>setAuthForm({...authForm, wa: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 outline-none focus:border-[#1800AD] text-xs font-medium transition-colors" placeholder="Contoh: 0811..." />
                  </div>
                  <div>
                      <label className="block text-[11px] font-bold text-[#001b3d] mb-2 uppercase tracking-widest">Kata Sandi*</label>
                      <input required type="password" value={authForm.password} onChange={e=>setAuthForm({...authForm, password: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 outline-none focus:border-[#1800AD] text-xs font-medium transition-colors" placeholder="Buat kata sandi" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-[#1800AD] text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform text-sm mt-2">
                      {loading ? 'Memproses...' : 'Masuk ke Sistem'}
                  </button>
               </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Klien Aktif:</p><p className="font-black text-lg text-[#001b3d] leading-none">{klienData.nama_lengkap}</p></div>
                <button onClick={handleLogout} className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"><LogOut size={20}/></button>
              </div>
              
              <div className="flex bg-slate-200/50 p-1.5 rounded-2xl mb-6">
                <button onClick={() => setFormTab('pesan')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${formTab === 'pesan' ? 'bg-white text-[#1800AD] shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Buat Pesanan</button>
                <button onClick={() => setFormTab('riwayat')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${formTab === 'riwayat' ? 'bg-white text-[#1800AD] shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Pantau & Riwayat ({clientOrders.length})</button>
              </div>

              {success ? (
                <div className="text-center py-12 bg-green-50 border border-green-100 rounded-[2rem] shadow-inner">
                   <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4 animate-bounce"/>
                   <h2 className="text-xl font-black text-green-800">Penugasan Terkirim!</h2>
                   <p className="text-xs font-medium text-green-600 mt-2 px-4">Ksatria kami sedang mempersiapkan peralatan menuju lokasi Anda.</p>
                </div>
              ) : formTab === 'pesan' ? (
                <form onSubmit={handleSubmit} className="space-y-5 border border-slate-200 p-6 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50">
                  <div className="flex gap-3">
                    <button type="button" onClick={() => {setTabLayanan('SETRIKA'); setPaketTerpilih(DAFTAR_PAKET[1]);}} className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all ${tabLayanan === 'SETRIKA' ? 'bg-[#004aad] text-white shadow-md' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>SetrikaKU</button>
                    <button type="button" onClick={() => {setTabLayanan('CLEANING'); setPaketTerpilih(DAFTAR_PAKET[4]);}} className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all ${tabLayanan === 'CLEANING' ? 'bg-[#0081cc] text-white shadow-md' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>CleaningKU</button>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    {DAFTAR_PAKET.filter(p => p.kategori === tabLayanan).map(p => (
                      <button type="button" key={p.id} onClick={() => { setPaketTerpilih(p); setSpecialRequest(''); }} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between text-left transition-all ${paketTerpilih.id === p.id ? 'border-[#1800AD] bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{p.nama}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{p.deskripsi}</p>
                        </div>
                        <p className="font-black text-sm text-[#1800AD]">Rp {p.harga/1000}k</p>
                      </button>
                    ))}
                  </div>
                  
                  {(paketTerpilih.id.includes('PRO') || paketTerpilih.id.includes('MAX')) && (
                     <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                       <label className="block text-[11px] font-bold text-[#001b3d] mb-2 flex justify-between items-center">
                         <span>Spesifikasi Hibrid</span>
                         <span className="text-[9px] font-medium bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Maks 150 Karakter</span>
                       </label>
                       <textarea maxLength={150} value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} rows={2} className="w-full p-3 border-none bg-white rounded-lg text-slate-900 text-xs shadow-sm outline-none focus:ring-2 focus:ring-[#1800AD]/20" placeholder="Ketik request tambahan: atur pakaian di lemari / cuci piring pasca acara..." />
                     </div>
                  )}
                  
                  <div>
                    <label className="block text-[11px] font-bold text-[#001b3d] mb-2 uppercase tracking-widest">Alamat Lengkap Lokasi Pekerjaan*</label>
                    <textarea required value={alamat} onChange={(e) => setAlamat(e.target.value)} rows={2} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 outline-none focus:border-[#1800AD] text-xs font-medium resize-none" placeholder="Detail jalan, blok, nomor rumah..." />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-[11px] font-bold text-[#001b3d] mb-2 uppercase tracking-widest">Tanggal*</label>
                       <input required type="date" value={tanggal} min={new Date().toISOString().split('T')[0]} onChange={(e) => setTanggal(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 outline-none focus:border-[#1800AD] text-xs font-medium" />
                     </div>
                     <div>
                       <label className="block text-[11px] font-bold text-[#001b3d] mb-2 uppercase tracking-widest">Jam*</label>
                       <select required value={jam} onChange={(e) => setJam(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 outline-none focus:border-[#1800AD] text-xs font-medium">
                          {availableSlots.length > 0 ? (availableSlots.map(slot => (<option key={slot.value} value={slot.value}>{slot.label}</option>))) : (<option value="">Penuh</option>)}
                       </select>
                     </div>
                  </div>
                  
                  <button type="submit" disabled={loading || !jam} className="w-full bg-[#1800AD] text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform text-sm mt-4 tracking-wide">
                    {loading ? 'Memproses Sistem...' : `Konfirmasi & Panggil Ksatria`}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 pb-4">
                  {clientOrders.length === 0 ? <p className="text-center text-xs font-medium text-slate-400 py-12">Belum ada riwayat pengerjaan.</p> : (
                    clientOrders.map(o => (
                      <div key={o.id} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-sm text-slate-900">{o.layanan}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">ID: #{o.id.substring(0,8).toUpperCase()}</p>
                          </div>
                          <span className="text-[9px] font-bold px-2.5 py-1 bg-[#1800AD]/10 text-[#1800AD] rounded-md uppercase tracking-wider">{o.status}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-600 mb-3 flex items-center gap-1.5"><CalendarDays size={12}/> {o.slot_waktu}</p>
                        
                        {/* FITUR UPGRADE DI TEMPAT */}
                        {o.status.toLowerCase() === 'pending' && o.paket_layanan.includes('FAST') && (
                          <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-[10px] text-amber-800 font-medium leading-relaxed mb-3">
                              ⚠️ <strong>Butuh Kerja Hibrid?</strong> Jika Ksatria sudah di rumah dan volume kerjaan Anda ternyata butuh layanan Hibrid (PRO/MAX), sesuaikan ukuran paket di bawah ini agar Ksatria bisa langsung eksekusi tanpa pulang!
                            </p>
                            <button type="button" onClick={() => setOrderToUpgrade(o)} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] py-2.5 rounded-lg transition-colors shadow-sm">
                               Sesuaikan Ukuran Paket
                            </button>
                          </div>
                        )}

                        {o.status.toLowerCase() === 'selesai' && (
                          <div className="mt-3 pt-4 border-t border-slate-100 flex justify-end">
                            <a href={`/invoice/${o.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-[#1800AD] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors uppercase tracking-wider">
                              Lihat E-Nota Resmi <ChevronRight size={14} />
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* --- MODAL UPGRADE PENYELASAI MASALAH DI LAPANGAN --- */}
      {orderToUpgrade && (
        <div className="fixed inset-0 bg-[#001b3d]/80 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl border border-slate-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 text-[#1800AD] rounded-full flex items-center justify-center mx-auto mb-3"><ArrowUpCircle size={24}/></div>
              <h3 className="text-base font-black text-[#001b3d]">SESUAIKAN LAYANAN</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Pilih tingkat paket yang sesuai dengan realita kebutuhan pekerjaan di rumah Anda saat ini.</p>
            </div>
            
            <div className="space-y-3">
              {DAFTAR_PAKET.filter(p => p.kategori === (orderToUpgrade.paket_layanan.startsWith('S') ? 'SETRIKA' : 'CLEANING') && !p.id.includes('FAST')).map(p => (
                <button key={p.id} onClick={() => handleExecuteUpgrade(p.id)} disabled={loading} className="w-full p-4 border border-slate-200 rounded-xl text-left hover:border-[#1800AD] hover:bg-blue-50/50 transition-all flex justify-between items-center group">
                  <div>
                    <p className="font-bold text-xs text-slate-900 group-hover:text-[#1800AD]">{p.nama}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{p.deskripsi}</p>
                  </div>
                  <span className="font-black text-xs text-[#1800AD]">Rp {p.harga/1000}k</span>
                </button>
              ))}
            </div>

            <button onClick={() => setOrderToUpgrade(null)} className="w-full bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs py-3 rounded-xl transition-colors mt-2">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* --- FITUR BARU: TESTIMONI KLIEN (SOCIAL PROOF) --- */}
      <section className="py-12 bg-white px-6 border-t border-slate-200">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
             <h3 className="text-lg font-black text-[#001b3d] uppercase tracking-wider">Apa Kata Mereka?</h3>
             <p className="text-xs text-slate-500 mt-2">Ribuan masalah rumah tangga warga Palu telah kami selesaikan.</p>
          </div>
          
          <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar gap-4">
            {TESTIMONIALS.map((testi) => (
              <div key={testi.id} className="min-w-[280px] bg-slate-50 border border-slate-200 rounded-2xl p-6 snap-center relative">
                <Quote size={40} className="text-slate-200 absolute top-4 right-4" />
                <div className="flex items-center gap-1 text-yellow-400 mb-3">
                  <Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/>
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed mb-6">"{testi.teks}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <img src={testi.foto} alt={testi.nama} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                  <div>
                    <p className="text-[11px] font-bold text-[#001b3d]">{testi.nama}</p>
                    <p className="text-[9px] text-slate-500 flex items-center gap-1"><MapPin size={10}/> {testi.alamat}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}} />
        </div>
      </section>

      {/* --- LAYER 3: FOOTER --- */}
      <footer id="layer-3" className="bg-[#001b3d] text-white pt-16 pb-10 px-6 border-t-[8px] border-[#1800AD]">
        <div className="max-w-md mx-auto space-y-12">
          
          <div className="space-y-3">
             <h4 className="text-[14px] font-black text-white uppercase tracking-widest">TENTANG KAMI</h4>
             <p className="text-[12px] text-slate-300 leading-relaxed font-normal text-justify">
               <span className="underline underline-offset-2 font-bold text-white">kerjaKU</span><span className="text-[#0081cc] font-bold">.click</span> adalah platform digital yang dikembangkan oleh PT. Kerjaku Bangun Negeri sebagai solusi mempertemukan mitra yang mempunyai tenaga & keahlian bernilai berharga dengan kebutuhan pemecahan masalah operasional rumah tangga perkotaan secara instan dan aman.
             </p>
          </div>

          <div className="space-y-5">
            <h4 className="text-[14px] font-black text-white uppercase tracking-widest">SISTEM INTEGRASI LAYANAN</h4>
            <div className="flex items-center gap-5">
               <div className="w-14 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white shrink-0">
                  <Shirt size={22} strokeWidth={1.5} />
               </div>
               <div><p className="text-[12px] font-bold text-white tracking-widest mb-0.5">SETRIKAKU</p><p className="text-[11px] text-slate-400">Fast - Pro - Max</p></div>
            </div>
            <div className="flex items-center gap-5">
               <div className="w-14 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white shrink-0">
                  <HomeIcon size={22} strokeWidth={1.5} />
               </div>
               <div><p className="text-[12px] font-bold text-white tracking-widest mb-0.5">CLEANINGKU</p><p className="text-[11px] text-slate-400">Fast - Pro - Max</p></div>
            </div>
          </div>

          <div className="space-y-5">
            <h4 className="text-[14px] font-black text-white uppercase tracking-widest">KONTAK & DUKUNGAN KLIEN</h4>
            <div className="flex items-center gap-5">
               <div className="w-10 h-10 bg-[#0081cc] rounded-full flex items-center justify-center text-white shrink-0"><MessageCircle size={20} strokeWidth={1.5} /></div>
               <div><p className="text-[11px] font-bold text-white uppercase tracking-widest mb-0.5">WHATSAPP CENTRAL CS</p><p className="text-[11px] text-slate-300">081145504178</p></div>
            </div>
            <div className="flex items-center gap-5">
               <div className="w-10 h-10 bg-[#0081cc] rounded-full flex items-center justify-center text-white shrink-0"><Mail size={20} strokeWidth={1.5} /></div>
               <div><p className="text-[11px] font-bold text-white uppercase tracking-widest mb-0.5">EMAIL RESMI</p><p className="text-[11px] text-slate-300">hikerjaku@gmail.com</p></div>
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t border-white/10">
            <h4 className="text-[12px] font-black text-white uppercase tracking-widest">PT. KERJAKU BANGUN NEGERI</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
               Jl. Muhammadiyah 2 Kelurahan Tondo Kecamatan Mantikulore Kota Palu 94119 Sulawesi Tengah
            </p>
          </div>

          <div className="pt-2 text-center">
             <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
               Copyright © 2026 PT. Kerjaku Bangun Negeri. All Rights Reserved.
             </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
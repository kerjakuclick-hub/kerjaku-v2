"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LogOut, AlertCircle, Share2, Headset, Power, UserSquare2, X, PlayCircle, Camera, CheckCircle2, UploadCloud, MapPin, Eye } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

const HARGA_PAKET: any = {
  'S-FAST': 60000, 'S-PRO': 85000, 'S-MAX': 175000,
  'C-SMALL': 75000, 'C-MEDIUM': 95000, 'C-LARGE': 175000
};

export default function MitraDashboard() {
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [mitraData, setMitraData] = useState<any>(null);
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [historyTasks, setHistoryTasks] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState('tugas');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);

  const NOMOR_WA_PA = "6287824697778";

  const getSaldo = (mt: any) => { if (!mt || !mt.dompet_mitra) return 0; if (Array.isArray(mt.dompet_mitra)) return mt.dompet_mitra[0]?.saldo_saat_ini || 0; return mt.dompet_mitra.saldo_saat_ini || 0; };

  useEffect(() => { const savedPhone = localStorage.getItem('mitra_phone'); if (savedPhone) handleAutoLogin(savedPhone); }, []);

  const handleAutoLogin = async (phone: string) => {
    const { data } = await supabase.from('mitra').select('*, dompet_mitra(saldo_saat_ini)').eq('no_wa', phone).single();
    if (data) { setMitraData(data); fetchData(data.id); } else { localStorage.removeItem('mitra_phone'); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { data } = await supabase.from('mitra').select('*, dompet_mitra(saldo_saat_ini)').eq('no_wa', phoneInput).eq('password', passwordInput).single();
    if (data) {
      if (data.status === 'suspend') { alert("AKUN DIBEKUKAN! Hubungi Divisi PA."); setLoading(false); return; }
      await supabase.from('mitra').update({ status: 'aktif' }).eq('id', data.id);
      data.status = 'aktif'; setMitraData(data); localStorage.setItem('mitra_phone', phoneInput); fetchData(data.id);
    } else { alert('No WA atau Password Salah!'); }
    setLoading(false);
  };

  const handleLogout = async () => { if (mitraData) await supabase.from('mitra').update({ status: 'offline' }).eq('id', mitraData.id); localStorage.removeItem('mitra_phone'); window.location.reload(); };

  const toggleAvailability = async () => { if(!mitraData) return; const newStatus = mitraData.status === 'aktif' ? 'offline' : 'aktif'; await supabase.from('mitra').update({ status: newStatus }).eq('id', mitraData.id); setMitraData({...mitraData, status: newStatus}); };

 const fetchData = async (mitraId: string) => {
    // 1. Ambil semua data tanpa filter apapun terlebih dahulu untuk tes
    const { data: act, error } = await supabase
      .from('pesanan')
      .select('*'); 
      // Hapus filter OR sementara untuk melihat apakah data bisa ditarik
    
    if (error) {
      console.error("Supabase Error:", error);
      return;
    }

    // 2. Filter secara manual di sini untuk memastikan kita tidak bergantung pada Supabase filter
    const myTasks = (act || []).filter(task => 
      task.mitra_id === mitraId || task.mitra_id_2 === mitraId
    );

    console.log("Data Pesanan Total:", act);
    console.log("Data Filtered untuk Mitra Ini:", myTasks);
    
    setActiveTasks(myTasks);
    // ... sisa fungsi hist, invs, trx tetap sama
  };

  const uploadFotoProfil = async (event: any) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `PROFIL-${mitraData.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('mitra_foto').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('mitra_foto').getPublicUrl(fileName);
      await supabase.from('mitra').update({ foto_url: data.publicUrl }).eq('id', mitraData.id);

      setMitraData({...mitraData, foto_url: data.publicUrl});
      alert('Foto Profil ID Card Berhasil Diperbarui!');
    } catch (error: any) { alert(`Error Upload: ${error.message}`); } finally { setUploading(false); }
  };

  const uploadFotoSOP = async (event: any, taskId: string, tipe: 'foto_sebelum' | 'foto_sesudah') => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `SOP-${taskId}-${tipe}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('bukti_kerja').upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('bukti_kerja').getPublicUrl(fileName);
      await supabase.from('pesanan').update({ [tipe]: data.publicUrl }).eq('id', taskId);
      
      alert(`Berhasil Upload ${tipe === 'foto_sebelum' ? 'Kondisi Awal' : 'Hasil Kerja'}!`);
      if(mitraData) fetchData(mitraData.id);
    } catch (error: any) { alert(`Error Upload: ${error.message}`); } finally { setUploading(false); }
  };

  const mulaiKerja = async (taskId: string) => {
     setLoading(true);
     await supabase.from('pesanan').update({ status: 'kerja', waktu_mulai_kerja: new Date().toISOString() }).eq('id', taskId);
     if(mitraData) fetchData(mitraData.id);
     setLoading(false);
  };

  const tandaiSelesai = async (task: any) => {
    if (!window.confirm("Selesaikan tugas ini? Jika ini tugas ganda, dompet Anda dan rekan Anda akan langsung diupdate.")) return;
    setLoading(true);
    
    const { data: currentTask } = await supabase.from('pesanan').select('status').eq('id', task.id).single();
    if (currentTask && currentTask.status === 'selesai') {
        alert('Tugas ini sudah diselesaikan oleh rekan Anda.');
        setLoading(false); 
        fetchData(mitraData.id);
        return;
    }

    const hargaNormalTotal = HARGA_PAKET[task.paket_layanan] || task.total_bayar || 85000;
    const uangTunaiKlien = task.total_bayar || hargaNormalTotal;

    const isDuaMitra = ['S-MAX', 'C-LARGE'].includes(task.paket_layanan) || task.mitra_id_2 != null;

    const hargaNormalPerMitra = isDuaMitra ? hargaNormalTotal / 2 : hargaNormalTotal;
    const uangTunaiPerMitra = isDuaMitra ? uangTunaiKlien / 2 : uangTunaiKlien;
    
    const nilaiDiskonPerMitra = hargaNormalPerMitra - uangTunaiPerMitra;

    let isCleaning = task.paket_layanan?.startsWith('C-') || task.layanan?.toLowerCase().includes('cleaning');
    let komisiPersen = isCleaning ? 0.14 : 0.15;
    let techFee = 3000;
    let productFee = isCleaning ? 7500 : 2500;

    const nilaiKomisi = hargaNormalPerMitra * komisiPersen;
    const totalPotonganStandar = nilaiKomisi + techFee + productFee;
    const targetPendapatanBersih = hargaNormalPerMitra - totalPotonganStandar;

    const potonganDompetAktual = totalPotonganStandar - nilaiDiskonPerMitra;

    await supabase.from('pesanan').update({ status: 'selesai' }).eq('id', task.id);

    const prosesDompetMitra = async (mId: string) => {
       await supabase.from('invoices').insert([{ order_id: task.id, mitra_id: mId, total_tagihan: hargaNormalPerMitra, potongan_komisi: totalPotonganStandar, pendapatan_bersih_mitra: targetPendapatanBersih }]);

       const { data: cekDompet } = await supabase.from('dompet_mitra').select('*').eq('mitra_id', mId).single();
       if (cekDompet) { await supabase.from('dompet_mitra').update({ saldo_saat_ini: cekDompet.saldo_saat_ini - potonganDompetAktual }).eq('mitra_id', mId); }

       await supabase.from('riwayat_transaksi').insert([
         { mitra_id: mId, jenis_transaksi: 'potongan_komisi', nominal: potonganDompetAktual, keterangan: `Fee & Bahan: ${task.nama_klien} (${isCleaning?'Clean':'Setrika'})` },
         { mitra_id: mId, jenis_transaksi: 'pendapatan_tugas', nominal: targetPendapatanBersih, keterangan: `Hak Pendapatan: ${task.nama_klien}` }
       ]);

       const kasEntries = [
           { tipe_arus: 'MASUK', sumber_dana: 'Rek. Pendapatan', kategori_modul: 'Komisi Perusahaan', nominal: nilaiKomisi + techFee, keterangan: `Auto GL: Komisi ${task.nama_klien}`, diinput_oleh: 'SISTEM', status_approval: 'APPROVED' },
           { tipe_arus: 'MASUK', sumber_dana: 'Rek. Pendapatan', kategori_modul: 'Penjualan Produk', nominal: productFee, keterangan: `Auto GL: Bahan ${task.nama_klien}`, diinput_oleh: 'SISTEM', status_approval: 'APPROVED' }
       ];
       if (nilaiDiskonPerMitra > 0) {
           kasEntries.push({ tipe_arus: 'KELUAR', sumber_dana: 'Rek. Pendapatan', kategori_modul: 'Biaya Marketing', nominal: nilaiDiskonPerMitra, keterangan: `Subsidi Promo AFL Klien ${task.nama_klien}`, diinput_oleh: 'SISTEM', status_approval: 'APPROVED' });
       }
       if (isCleaning) {
           kasEntries.push({ tipe_arus: 'KELUAR', sumber_dana: 'Rek. Pendapatan', kategori_modul: 'Biaya Marketing', nominal: hargaNormalPerMitra * 0.01, keterangan: `Subsidi Chemical Klien ${task.nama_klien}`, diinput_oleh: 'SISTEM', status_approval: 'APPROVED' });
       }
       await supabase.from('buku_kas_perusahaan').insert(kasEntries);
    };

    if (task.mitra_id) await prosesDompetMitra(task.mitra_id);
    if (isDuaMitra && task.mitra_id_2 && task.mitra_id_2 !== task.mitra_id) {
       await prosesDompetMitra(task.mitra_id_2);
    }

    handleAutoLogin(mitraData.no_wa);
    alert('Tugas Selesai! Logika Pembagian Hasil V3 berhasil dieksekusi.');
    setLoading(false);
  };

  const formatWA = (wa: string) => { let f = (wa||'').replace(/\D/g, ''); if(f.startsWith('0')) f='62'+f.substring(1); return f; };
  const saldoTerkini = getSaldo(mitraData);
  const isSameDay = (d1: Date, d2: Date) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  const now = new Date();
  const incomeToday = invoices.filter(i => isSameDay(new Date(i.created_at), now)).reduce((sum, i) => sum + i.pendapatan_bersih_mitra, 0);
  const incomeWeek = invoices.filter(i => new Date(i.created_at) >= new Date(now.getTime() - 7*24*60*60*1000)).reduce((sum, i) => sum + i.pendapatan_bersih_mitra, 0);
  const incomeMonth = invoices.filter(i => new Date(i.created_at).getMonth() === now.getMonth() && new Date(i.created_at).getFullYear() === now.getFullYear()).reduce((sum, i) => sum + i.pendapatan_bersih_mitra, 0);

  if (!mitraData) { return ( <div className="min-h-screen bg-slate-900 flex justify-center items-center p-6"><form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-3xl w-full max-sm:w-full max-w-sm space-y-4"><h1 className="text-4xl font-black text-white text-center italic">kerjaKU</h1><input required type="tel" value={phoneInput} onChange={e=>setPhoneInput(e.target.value)} className="w-full p-4 rounded-xl font-black text-center" placeholder="No WA (08...)" /><input required type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} className="w-full p-4 rounded-xl font-black text-center" placeholder="Password" /><button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-900">{loading ? 'MEMUAT...' : 'LOGIN KSATRIA'}</button></form></div> ); }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      
      {showIdCard && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex justify-center items-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-[2rem] relative overflow-hidden shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setShowIdCard(false)} className="absolute top-4 right-4 text-white hover:text-slate-200 z-10 p-1"><X size={24}/></button>
            <div className="bg-blue-600 p-8 text-center text-white">
              <h2 className="text-2xl font-black italic">kerjaKU</h2>
              <p className="text-[10px] tracking-widest uppercase font-bold opacity-80 mt-1">ID Card Digital</p>
            </div>
            <div className="p-8 text-center flex flex-col items-center bg-slate-50">
               <div className="relative mb-4 group cursor-pointer w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-slate-200 flex items-center justify-center shadow-lg -mt-16 z-20">
                  {mitraData.foto_url ? <img src={mitraData.foto_url} alt="Foto" className="w-full h-full object-cover" /> : <UserSquare2 size={50} className="text-slate-400"/>}
                  <div className="absolute inset-0 bg-black/60 hidden group-hover:flex flex-col items-center justify-center text-white text-[8px] font-black"><Camera size={16}/><br/>GANTI FOTO</div>
                  <input type="file" accept="image/*" onChange={uploadFotoProfil} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer z-30" />
               </div>
               {uploading && <p className="text-[10px] text-blue-600 font-bold mb-3 animate-pulse">Mengupload foto...</p>}
               <h3 className="text-xl font-black text-slate-900">{mitraData.nama_lengkap}</h3>
               <p className="text-[10px] font-black text-blue-600 mb-6 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full mt-2 border border-blue-200">{mitraData.keahlian}</p>
               <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                 <QRCodeSVG value={`https://kerjaku.click/idcard/${mitraData.id}`} size={140} />
               </div>
               <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase">Scan untuk verifikasi</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 text-white p-6 rounded-b-[2.5rem] sticky top-0 z-40 shadow-lg border-b-4 border-blue-600">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-black italic">kerjaKU</h1>
           <div className="flex gap-2">
              <button onClick={() => setShowIdCard(true)} className="p-2 bg-slate-800 hover:bg-slate-700 transition-colors rounded-full text-white"><UserSquare2 size={18}/></button>
              <a href={`https://wa.me/${NOMOR_WA_PA}`} target="_blank" className="p-2 bg-slate-800 hover:bg-slate-700 transition-colors rounded-full text-blue-400"><Headset size={18}/></a>
              <button onClick={handleLogout} className="p-2 bg-slate-800 hover:bg-slate-700 transition-colors rounded-full text-red-400"><LogOut size={18}/></button>
           </div>
        </div>
        <div className="flex items-center justify-between"><div className="flex items-center gap-4">{mitraData.foto_url ? <img src={mitraData.foto_url} className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 cursor-pointer" onClick={() => setShowIdCard(true)}/> : <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center font-black text-xl cursor-pointer" onClick={() => setShowIdCard(true)}>{mitraData.nama_lengkap.charAt(0)}</div>}<div><h2 className="text-lg font-black">{mitraData.nama_lengkap}</h2><h3 className={`text-xl font-black ${saldoTerkini < 25000 ? 'text-red-400' : 'text-green-400'}`}>Rp {saldoTerkini.toLocaleString('id-ID')}</h3>{saldoTerkini < 25000 && <p className="text-[9px] text-red-400 italic font-bold">Isi Saldo min Rp 25.000</p>}</div></div><button onClick={toggleAvailability} className={`p-2 rounded-xl border-2 transition-colors ${mitraData.status === 'aktif' ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-slate-600 text-slate-500'}`}><Power size={20}/></button></div>
      </div>

      <main className="p-6 max-w-lg mx-auto space-y-6">
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border-2"><button onClick={() => setActiveTab('tugas')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'tugas' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>Tugas</button><button onClick={() => setActiveTab('riwayat')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'riwayat' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>Riwayat</button><button onClick={() => setActiveTab('keuangan')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'keuangan' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>Dompet</button></div>

        {activeTab === 'tugas' && (
          <div className="space-y-4">
            {mitraData.status !== 'aktif' && <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-2xl font-black text-xs text-center flex items-center justify-center gap-2"><AlertCircle size={16}/> STATUS ANDA OFF.</div>}
            {activeTasks.length === 0 && mitraData.status === 'aktif' && <p className="text-center text-slate-400 text-xs py-10 font-bold italic">Radar Tugas Aktif. Menunggu penugasan...</p>}
            
            {activeTasks.map(t => (
              <div key={t.id} className="p-6 rounded-3xl border-2 bg-white shadow-sm space-y-4">
                <div className="flex justify-between items-center mb-2"><p className="text-xs text-blue-600 font-black">{t.layanan}</p>{t.status === 'kerja' && <span className="bg-blue-600 text-white px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 animate-pulse"><PlayCircle size={12}/> SEDANG KERJA</span>}</div>
                <div><h4 className="text-xl font-extrabold">{t.nama_klien}</h4><p className="text-[10px] font-black text-slate-500">{t.slot_waktu}</p></div>
                <p className="bg-slate-50 p-4 rounded-xl text-sm font-extrabold border border-slate-100 flex items-start gap-2 text-slate-900"><MapPin size={24} className="text-blue-600 shrink-0"/> {t.alamat_detail}</p>
                
                {t.status === 'kerja' && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 grid grid-cols-2 gap-3">
                     <div className="relative border-2 border-dashed border-blue-300 bg-white rounded-lg p-3 text-center cursor-pointer hover:border-blue-500 transition-colors z-0">
                        {t.foto_sebelum ? <CheckCircle2 className="mx-auto text-green-500 mb-1" size={20}/> : <UploadCloud className="mx-auto text-blue-500 mb-1" size={20}/>}
                        <p className="text-[9px] font-black uppercase text-blue-900">{t.foto_sebelum ? 'Awal (Selesai)' : '1. Kondisi Awal'}</p>
                        <input type="file" accept="image/*" capture="environment" onChange={(e) => uploadFotoSOP(e, t.id, 'foto_sebelum')} disabled={uploading || t.foto_sebelum} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                     </div>
                     <div className="relative border-2 border-dashed border-blue-300 bg-white rounded-lg p-3 text-center cursor-pointer hover:border-blue-500 transition-colors z-0">
                        {t.foto_sesudah ? <CheckCircle2 className="mx-auto text-green-500 mb-1" size={20}/> : <Camera className="mx-auto text-blue-500 mb-1" size={20}/>}
                        <p className="text-[9px] font-black uppercase text-blue-900">{t.foto_sesudah ? 'Akhir (Selesai)' : '2. Hasil Kerja'}</p>
                        <input type="file" accept="image/*" capture="environment" onChange={(e) => uploadFotoSOP(e, t.id, 'foto_sesudah')} disabled={uploading || t.foto_sesudah} className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
                     </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <a href={`https://wa.me/${formatWA(t.no_wa_klien)}`} target="_blank" className="py-4 bg-green-500 text-white rounded-xl font-black text-xs uppercase text-center flex items-center justify-center shadow-md hover:bg-green-600 transition-colors">Chat Klien</a>
                  {t.status === 'proses' ? (
                    <button onClick={() => mulaiKerja(t.id)} disabled={loading} className="py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors">{loading ? '...' : 'Mulai Kerja'}</button>
                  ) : (
                    <button onClick={() => tandaiSelesai(t)} disabled={loading} className="py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase shadow-lg hover:bg-slate-800 transition-colors">{loading ? '...' : 'Selesai Kerja'}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- UPDATE: DUA TOMBOL DI RIWAYAT (LIHAT & KIRIM WA) --- */}
        {activeTab === 'riwayat' && (
          <div className="space-y-4">{historyTasks.map(t => (
            <div key={t.id} className="bg-white p-4 rounded-2xl border-2 hover:border-blue-200 transition-colors text-slate-900">
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <p className="font-extrabold text-sm text-slate-900">{t.nama_klien}</p>
                     <p className="text-[10px] font-bold text-slate-500">{t.slot_waktu}</p>
                  </div>
               </div>
               <div className="flex gap-2 border-t border-slate-100 pt-3">
                  <a href={`https://kerjaku.click/invoice/${t.id}`} target="_blank" className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-black text-[10px] flex items-center justify-center gap-1 hover:bg-slate-200 transition-colors uppercase tracking-widest"><Eye size={14}/> Lihat</a>
                  <a href={`https://wa.me/${formatWA(t.no_wa_klien)}?text=Halo%20Kak%20${t.nama_klien},%20terima%20kasih%20telah%20menggunakan%20jasa%20kerjaKU.%20Berikut%20adalah%20E-Nota%20dan%20bukti%20pekerjaan%20kami:%20https://kerjaku.click/invoice/${t.id}`} target="_blank" className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg font-black text-[10px] flex items-center justify-center gap-1 border border-green-200 hover:bg-green-100 transition-colors uppercase tracking-widest"><Share2 size={14}/> Kirim WA</a>
               </div>
            </div>
          ))}</div>
        )}

        {activeTab === 'keuangan' && (
          <div className="space-y-6 text-slate-900">
             <div className={`p-8 rounded-[2rem] border-2 text-center shadow-sm ${saldoTerkini < 25000 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                <p className="text-xs font-black uppercase text-slate-500 mb-2">Saldo Deposit Sistem</p>
                <h2 className={`text-4xl font-black ${saldoTerkini < 25000 ? 'text-red-600' : 'text-blue-700'}`}>Rp {saldoTerkini.toLocaleString('id-ID')}</h2>
             </div>
             <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl border border-slate-800">
                <h3 className="text-[10px] font-black uppercase text-blue-400 mb-6 tracking-widest">Pendapatan Bersih Mitra</h3>
                <div className="space-y-4"><div className="flex justify-between border-b border-slate-800 pb-3 items-center"><span className="text-sm font-bold text-slate-100">Hari Ini</span><span className="text-xl font-black">Rp {incomeToday.toLocaleString('id-ID')}</span></div><div className="flex justify-between border-b border-slate-800 pb-3 items-center"><span className="text-sm font-bold text-slate-100">Minggu Ini</span><span className="text-xl font-black">Rp {incomeWeek.toLocaleString('id-ID')}</span></div><div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-100">Bulan Ini</span><span className="text-xl font-black text-green-400">Rp {incomeMonth.toLocaleString('id-ID')}</span></div></div>
             </div>
             <div className="bg-white rounded-[2rem] border-2 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">Riwayat Mutasi Saldo</div>
                <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                   {transactions.map(t => (
                     <div key={t.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors text-slate-900 hover:text-slate-900"><div className="pr-4 w-2/3"><p className="text-[9px] font-bold text-slate-400 mb-1">{new Date(t.created_at).toLocaleDateString('id-ID')}</p><p className="font-extrabold text-xs text-slate-900 leading-tight">{t.keterangan}</p></div><div className="text-right shrink-0">{t.jenis_transaksi === 'potongan_komisi' ? (<span className="text-red-600 font-black text-sm">- {t.nominal / 1000}k</span>) : (<span className="text-green-600 font-black text-sm">+ {t.nominal / 1000}k</span>)}</div></div>
                   ))}
                   {transactions.length === 0 && <p className="text-center text-xs font-bold text-slate-400 py-10">Belum ada mutasi.</p>}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
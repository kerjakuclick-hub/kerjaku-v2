"use client";
import { hitungKeuanganPesanan } from '../../utils/financeEngine';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, Users, ClipboardList, Wallet, Menu, LogOut, Megaphone, Power, 
  BookOpen, PlusCircle, BadgeCheck, XOctagon, ShieldAlert, Trash2, Edit, Check, X, Camera, MapPin, Clock, User
} from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [mitras, setMitras] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [cashBook, setCashBook] = useState<any[]>([]);

  const [timeFilter, setTimeFilter] = useState('semua');
  const [mitraFilter, setMitraFilter] = useState('semua');

  const [newMitra, setNewMitra] = useState({ nama_lengkap: '', no_wa: '', keahlian: 'Setrika & Cleaning', level: 'Trainee', password: '' });
  const [newAFL, setNewAFL] = useState({ nama: '', ig: '', level: 'AFLNano', kode: '', channels: 'Instagram' });
  const [selectedMitraForOrder, setSelectedMitraForOrder] = useState<Record<string, string>>({});
  const [selectedMitra2ForOrder, setSelectedMitra2ForOrder] = useState<Record<string, string>>({});
  const [newCashEntry, setNewCashEntry] = useState({ tipe: 'MASUK', sumber: 'Kas Tunai', kategori: 'Komisi Perusahaan', nominal: '', keterangan: '' });

  const [editingMitraId, setEditingMitraId] = useState<string | null>(null);
  const [tempKeahlian, setTempKeahlian] = useState('');

  useEffect(() => { if (localStorage.getItem('admin_session') === 'active') { setIsLoggedIn(true); fetchAllData(); } }, []);

  const fetchAllData = async () => {
    const { data: pgn } = await supabase.from('pesanan').select('*').order('created_at', { ascending: false }); if (pgn) setOrders(pgn);
    const { data: mt } = await supabase.from('mitra').select('*, dompet_mitra(saldo_saat_ini)').order('created_at', { ascending: false }); if (mt) setMitras(mt);
    const { data: afl } = await supabase.from('affiliates').select('*').order('created_at', { ascending: false }); if (afl) setAffiliates(afl);
    const { data: trx } = await supabase.from('riwayat_transaksi').select('*').order('created_at', { ascending: false }); 
    if (trx && mt) {
       const trxLengkap = trx.map(t => { const ksatria = mt.find(m => m.id === t.mitra_id); return { ...t, mitra: { nama_lengkap: ksatria ? ksatria.nama_lengkap : 'Ksatria Dihapus' } }; });
       setTransactions(trxLengkap);
    }
    const { data: cash } = await supabase.from('buku_kas_perusahaan').select('*').order('tanggal', { ascending: false }); if (cash) setCashBook(cash);
  };

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); if (passwordInput === "KERJAKU2026") { setIsLoggedIn(true); localStorage.setItem('admin_session', 'active'); fetchAllData(); } else alert("Password Salah!"); };
  const handleLogout = () => { localStorage.removeItem('admin_session'); window.location.reload(); };
  const getSaldo = (mt: any) => mt?.dompet_mitra?.[0]?.saldo_saat_ini || mt?.dompet_mitra?.saldo_saat_ini || 0;

 const handleAssignTugas = async (orderId: string, butuhDuaKsatria: boolean) => {
    // 1. Tangkap Ksatria yang Anda pilih dari Dropdown UI
    let finalMitraId = selectedMitraForOrder[orderId];

    // Cek pesanan di database saat ini
    const { data: currentOrder } = await supabase.from('pesanan').select('*').eq('id', orderId).single();

    // Jika dropdown tidak disentuh, gunakan data yang sudah ada di database (jika ada)
    if (!finalMitraId) {
        finalMitraId = currentOrder?.mitra_id;
    }

    // Jika benar-benar kosong, hentikan dan peringatkan Admin
    if (!finalMitraId) {
        alert("Silakan pilih nama Ksatria dari kotak pilihan terlebih dahulu sebelum menekan DEPLOY!");
        return;
    }

    // 2. KUNCI PENYELESAIAN: Simpan Ksatria terpilih ke database pesanan SEBELUM mesin keuangan berjalan
    await supabase.from('pesanan').update({ 
    mitra_id: finalMitraId,
    status: 'DITUGASKAN' // <-- Ini adalah kunci pembuka gerbangnya!
}).eq('id', orderId);

    // 3. Tarik data terbaru yang sudah akurat
    const { data: orderData } = await supabase.from('pesanan').select('*').eq('id', orderId).single();
    const { data: mitraData } = await supabase.from('mitra').select('*').eq('id', finalMitraId).single();

    if (!mitraData) {
        alert("Error: Data Ksatria tidak ditemukan di database.");
        return;
    }
let mitraData2: any = null;
    // 2. Panggil skema Finance Engine 55:45
    const skema = hitungKeuanganPesanan(orderData.paket_layanan);

    if (!skema) {
      alert("Error: Skema perhitungan paket tidak ditemukan!");
      return;
    }
    // 3. Tentukan nominal potongan yang benar
    const nominalPotongan = skema.isDualKsatria 
      ? skema.minSaldoUtama 
      : skema.totalPotonganPlatform;

    // 4. Eksekusi pemotongan saldo Dompet
   const saldoBaru = (mitraData.saldo_dompet || 0) - (nominalPotongan || 0);

    await supabase
      .from('mitra')
      .update({ saldo_dompet: saldoBaru })
      .eq('id', mitraData.id);

    // --- GARIS AMAN: Kode WA Anda di bawah ini (baris 77) biarkan saja ---
    if (mitraData && orderData) { 
        let hpKlien = orderData.no_wa_klien.replace(/\D/g, ''); if(hpKlien.startsWith('0')) hpKlien = '62' + hpKlien.substring(1);
        let pesan = `Halo Kak ${orderData.nama_klien}, pesanan kerjaKU Anda telah dikonfirmasi!\n\nKsatria Utama: *${mitraData.nama_lengkap}*`;
        if(mitraData2) pesan += `\nKsatria Pendamping: *${mitraData2.nama_lengkap}*`;
        pesan += `\nJadwal: ${orderData.slot_waktu}\n\nLihat ID Card:\nUtama: https://kerjaku.click/idcard/${mitraData.id}`;
        if(mitraData2) pesan += `\nPendamping: https://kerjaku.click/idcard/${mitraData2.id}`;
        window.open(`https://wa.me/${hpKlien}?text=${encodeURIComponent(pesan)}`, '_blank');
    }
  };

  const batalkanTugas = async (orderId: string) => { if(window.confirm("Batalkan tugas ini?")) { await supabase.from('pesanan').update({ mitra_id: null, mitra_id_2: null, status: 'pending', waktu_mulai_kerja: null }).eq('id', orderId); fetchAllData(); } };
  
  const tambahMitra = async () => {
    if(!newMitra.password) return alert("Password Mitra wajib diisi!");
    const { data } = await supabase.from('mitra').insert([{ nama_lengkap: newMitra.nama_lengkap, no_wa: newMitra.no_wa, keahlian: newMitra.keahlian, status: 'offline', password: newMitra.password }]).select();
    if (data && data.length > 0) { await supabase.from('dompet_mitra').insert([{ mitra_id: data[0].id, saldo_saat_ini: 0 }]); alert('Berhasil!'); setNewMitra({ nama_lengkap: '', no_wa: '', keahlian: 'Setrika & Cleaning', level: 'Trainee', password: '' }); fetchAllData(); }
  };

  const updateKeahlianMitra = async (id: string) => {
    const { error } = await supabase.from('mitra').update({ keahlian: tempKeahlian }).eq('id', id);
    if(!error) { alert("Keahlian Diperbarui!"); setEditingMitraId(null); fetchAllData(); }
  };

  const toggleStatusMitra = async (id: string, st: string) => { 
    const n = st === 'suspend' ? 'offline' : 'suspend'; 
    if(window.confirm(`Apakah Anda yakin ingin ${n === 'suspend' ? 'MENSUSPEND' : 'MENGAKTIFKAN KEMBALI'} mitra ini?`)){ 
        await supabase.from('mitra').update({ status: n }).eq('id', id); fetchAllData(); 
    } 
  };

  const hapusMitra = async (id: string) => { 
    if(window.confirm(`PERINGATAN: Menghapus mitra akan menghilangkan seluruh riwayat kerjanya. Hapus permanen?`)){ 
        await supabase.from('mitra').delete().eq('id', id); fetchAllData(); 
    } 
  };

  const handleTopUp = async (mitraId: string, nama: string, currentSaldo: number) => {
    const input = window.prompt(`Nominal TOP UP DEPOSIT untuk ${nama}:`); if (!input) return; const nominal = parseInt(input, 10);
    const { data: cekDompet } = await supabase.from('dompet_mitra').select('*').eq('mitra_id', mitraId).single();
    if (cekDompet) { await supabase.from('dompet_mitra').update({ saldo_saat_ini: currentSaldo + nominal }).eq('mitra_id', mitraId); } else { await supabase.from('dompet_mitra').insert([{ mitra_id: mitraId, saldo_saat_ini: nominal }]); }
    await supabase.from('riwayat_transaksi').insert([{ mitra_id: mitraId, jenis_transaksi: 'top_up', nominal: nominal, keterangan: 'Top Up Admin' }]);
    fetchAllData();
  };

  const tambahAFL = async () => {
    if(!newAFL.kode) return alert("Kode wajib diisi!");
    let nominal = 2500; let free = "1x Setrika"; if(newAFL.level === 'AFLPro') { nominal = 10000; free = "8x Setrika"; } else if(newAFL.level === 'AFLMicro') { nominal = 5000; free = "2x Setrika"; }
    await supabase.from('affiliates').insert([{ nama_afiliator: newAFL.nama, username_ig: newAFL.ig, level: newAFL.level, nilai_promo: nominal, kode_referral: newAFL.kode.toUpperCase(), layanan_free: free, channels: newAFL.channels, status: 'aktif' }]);
    alert('AFL Aktif!'); setNewAFL({ nama: '', ig: '', level: 'AFLNano', kode: '', channels: 'Instagram' }); fetchAllData();
  };
  const toggleStatusAFL = async (id: string, currentStatus: string, kode: string) => { const newStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif'; if(window.confirm(`Ubah status AFL?`)) { await supabase.from('affiliates').update({ status: newStatus }).eq('id', id); await supabase.from('promo_codes').update({ aktif: newStatus === 'aktif' }).eq('kode', kode); fetchAllData(); } };

  const inputBukuKas = async () => {
    if(!newCashEntry.nominal) return alert("Isi nominal!");
    await supabase.from('buku_kas_perusahaan').insert([{ tipe_arus: newCashEntry.tipe, sumber_dana: newCashEntry.sumber, kategori_modul: newCashEntry.kategori, nominal: parseInt(newCashEntry.nominal), keterangan: newCashEntry.keterangan, diinput_oleh: 'Admin Utama', status_approval: 'PENDING' }]);
    alert('Diajukan!'); setNewCashEntry({ ...newCashEntry, nominal: '', keterangan: '' }); fetchAllData();
  };
  const approveTransaksi = async (id: string) => { if(window.confirm("Setujui transaksi ini?")) { await supabase.from('buku_kas_perusahaan').update({ status_approval: 'APPROVED' }).eq('id', id); fetchAllData(); } };

  const approvedCash = cashBook.filter(c => c.status_approval === 'APPROVED');
  const saldoTunai = approvedCash.filter(c => c.sumber_dana === 'Kas Tunai').reduce((sum, c) => c.tipe_arus === 'MASUK' ? sum + c.nominal : sum - c.nominal, 0);
  const saldoPendapatan = approvedCash.filter(c => c.sumber_dana === 'Rek. Pendapatan').reduce((sum, c) => c.tipe_arus === 'MASUK' ? sum + c.nominal : sum - c.nominal, 0);
  const saldoDeposito = mitras.reduce((sum, m) => sum + getSaldo(m), 0);

  const filteredTransactions = transactions.filter(t => {
    if (mitraFilter !== 'semua' && t.mitra_id !== mitraFilter) return false;
    if (timeFilter !== 'semua') { const d = new Date(t.created_at); const n = new Date(); if (timeFilter === 'hari') return d.toDateString() === n.toDateString(); else if (timeFilter === 'minggu') return d >= new Date(n.getTime() - 7*24*60*60*1000); else if (timeFilter === 'bulan') return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }
    return true;
  });

  if (!isLoggedIn) return <div className="min-h-screen bg-slate-900 flex justify-center items-center"><form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl space-y-4 shadow-2xl"><h1 className="text-3xl font-black italic">kerjaKU</h1><input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full p-4 border-2 rounded-xl outline-none focus:border-blue-600" placeholder="Password Admin" /><button className="w-full bg-slate-900 text-white p-4 rounded-xl font-black">LOGIN RUANG KOMANDO</button></form></div>;

  const menuItems = [ { id: 'dashboard', label: 'Pesanan Masuk', icon: <LayoutDashboard size={20} /> }, { id: 'tugas', label: 'Dispatch Tugas', icon: <ClipboardList size={20} /> }, { id: 'mitra', label: 'Data Mitra', icon: <Users size={20} /> }, { id: 'affiliator', label: 'Afiliator/AFL', icon: <Megaphone size={20} /> }, { id: 'bukukas', label: 'Buku Kas (GL)', icon: <BookOpen size={20} /> }, { id: 'keuangan', label: 'Analitik Bisnis', icon: <Wallet size={20} /> } ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <aside className={`bg-slate-900 text-white ${isSidebarOpen ? 'w-64' : 'w-20'} relative z-50 transition-all`}><div className="p-6 flex items-center gap-3 border-b border-slate-800"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black">K</div>{isSidebarOpen && <span className="font-black text-xl italic">kerjaKU</span>}</div><nav className="p-4 space-y-2">{menuItems.map(i => (<button key={i.id} onClick={() => setActiveTab(i.id)} className={`w-full flex items-center gap-4 p-3 rounded-xl font-bold ${activeTab === i.id ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{i.icon} {isSidebarOpen && <span>{i.label}</span>}</button>))} <button onClick={handleLogout} className="w-full flex items-center gap-4 p-3 rounded-xl font-bold text-red-400 mt-10"><LogOut size={20} /> {isSidebarOpen && <span>Logout</span>}</button></nav></aside>
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm"><button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2"><Menu size={24} /></button><p className="text-xs font-black uppercase tracking-widest text-slate-500">Ruang Komando Utama</p></header>
        <div className="p-6 max-w-7xl mx-auto w-full space-y-8 pb-20">
          
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><div className="bg-white p-6 rounded-3xl border-2"><p className="text-[10px] font-black uppercase text-slate-500">Total Pesanan</p><h3 className="text-3xl font-black">{orders.length}</h3></div><div className="bg-white p-6 rounded-3xl border-2"><p className="text-[10px] font-black uppercase text-slate-500 text-green-600">Mitra Aktif</p><h3 className="text-3xl font-black">{mitras.filter(m=>m.status!=='suspend').length}</h3></div><div className="bg-white p-6 rounded-3xl border-2"><p className="text-[10px] font-black uppercase text-slate-500 text-orange-600">Marketing AFL</p><h3 className="text-3xl font-black">Rp {orders.filter(o=>o.kode_promo && o.status==='selesai').reduce((sum,o)=>sum+(85000-(o.total_bayar||85000)),0).toLocaleString('id-ID')}</h3></div></div>
              <h2 className="text-2xl font-black italic uppercase">PESANAN MASUK</h2>
              
              {/* --- TABEL PESANAN MASUK DENGAN INFORMASI LENGKAP --- */}
              <div className="bg-white rounded-3xl border-2 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-200 text-xs font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Klien & Lokasi</th>
                      <th className="px-6 py-4">Layanan & Jadwal</th>
                      <th className="px-6 py-4">Status & SOP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50">
                         {/* Kolom Klien & Alamat */}
                         <td className="px-6 py-4 align-top">
                            <p className="font-black text-slate-900">{o.nama_klien}</p>
                            <p className="text-xs font-bold text-slate-600 mb-2">{o.no_wa_klien}</p>
                            <div className="text-[10px] font-bold text-slate-500 max-w-xs leading-tight flex items-start gap-1">
                               <MapPin size={14} className="shrink-0 mt-0.5 text-blue-500"/>
                               <span>{o.alamat_detail}</span>
                            </div>
                         </td>
                         
                         {/* Kolom Layanan, Jam, & Preferensi */}
                         <td className="px-6 py-4 align-top">
                            <p className="text-xs font-black text-blue-700 uppercase mb-2">{o.layanan}</p>
                            <div className="space-y-1.5">
                               <p className="text-[10px] font-bold text-slate-700 flex items-center gap-1 bg-slate-100 w-fit px-2 py-1 rounded">
                                  <Clock size={12} className="text-orange-500"/> {o.slot_waktu}
                               </p>
                               <p className="text-[10px] font-bold text-slate-700 flex items-center gap-1 bg-slate-100 w-fit px-2 py-1 rounded">
                                  <User size={12} className="text-slate-400"/> Pref: <span className="font-black">{o.preferensi_gender || 'Bebas'}</span>
                               </p>
                            </div>
                            {o.kode_promo && <span className="inline-block mt-2 bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-orange-200">Ref: {o.kode_promo}</span>}
                         </td>
                         
                         {/* Kolom Status & Bukti Foto */}
                         <td className="px-6 py-4 align-top">
                            <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase ${o.status === 'selesai' ? 'bg-green-500 text-white' : o.status === 'kerja' ? 'bg-blue-600 text-white animate-pulse' : o.status === 'proses' ? 'bg-blue-400 text-white' : 'bg-yellow-400'}`}>{o.status}</span> 
                            {o.waktu_mulai_kerja && <p className="text-[10px] font-black text-slate-500 mt-2">Mulai: {new Date(o.waktu_mulai_kerja).toLocaleTimeString('id-ID')}</p>}
                            
                            {(o.foto_sebelum || o.foto_sesudah) && (
                              <div className="flex gap-2 mt-3 flex-wrap">
                                {o.foto_sebelum && <a href={o.foto_sebelum} target="_blank" className="flex items-center gap-1 text-[9px] font-black bg-orange-100 text-orange-700 px-2 py-1 rounded border border-orange-200 hover:bg-orange-200"><Camera size={10}/> SOP Awal</a>}
                                {o.foto_sesudah && <a href={o.foto_sesudah} target="_blank" className="flex items-center gap-1 text-[9px] font-black bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200 hover:bg-green-200"><Camera size={10}/> SOP Akhir</a>}
                              </div>
                            )}
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {activeTab === 'tugas' && (
             <div className="animate-in fade-in space-y-6">
                <h2 className="text-2xl font-black italic uppercase">Dispatch System V2</h2>
                <div className="bg-white rounded-3xl border-2 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-200 text-xs font-black uppercase tracking-widest"><tr><th className="px-6 py-4">Klien & Jadwal</th><th className="px-6 py-4">Status Layanan</th><th className="px-6 py-4 text-right">Penugasan Ksatria</th></tr></thead><tbody className="divide-y-2">
                {orders.filter(o => o.status !== 'selesai').map((o) => { 
                   const isCleaningOrder = o.layanan?.toLowerCase().includes('cleaning');
                   const reqSaldo = isCleaningOrder ? 25000 : 20000;
                   const butuhDuaKsatria = o.paket_layanan === 'S-MAX' || o.paket_layanan === 'C-LARGE' || (o.layanan?.toUpperCase().includes('MAX')) || (o.layanan?.toUpperCase().includes('LARGE'));
                   const eligibleMitras = mitras.filter(m => m.status !== 'suspend' && getSaldo(m) >= reqSaldo && (isCleaningOrder ? m.keahlian?.toLowerCase().includes('cleaning') : m.keahlian?.toLowerCase().includes('setrika')));

                   return ( <tr key={o.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-black">{o.nama_klien}<p className="text-[10px] text-orange-600 font-bold">{o.slot_waktu}</p></td><td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-[10px] font-black uppercase">{o.layanan}</span></td><td className="px-6 py-4 flex justify-end gap-2">{!o.mitra_id ? (<div className="flex flex-col gap-2"><select onChange={(e) => setSelectedMitraForOrder({...selectedMitraForOrder, [o.id]: e.target.value})} className="p-2 border-2 rounded-xl text-xs font-black"><option value="">Pilih Utama...</option>{eligibleMitras.map(m => <option key={m.id} value={m.id}>{m.nama_lengkap}</option>)}</select>{butuhDuaKsatria && ( <select onChange={(e) => setSelectedMitra2ForOrder({...selectedMitra2ForOrder, [o.id]: e.target.value})} className="p-2 border-2 rounded-xl text-xs font-black"><option value="">Pilih Pendamping...</option>{eligibleMitras.map(m => <option key={m.id} value={m.id}>{m.nama_lengkap}</option>)}</select> )}<button onClick={() => handleAssignTugas(o.id, butuhDuaKsatria)} className="px-5 py-2 rounded-xl font-black text-xs uppercase bg-slate-900 text-white">Deploy</button></div>) : (<div className="flex items-center gap-3"><span className="text-xs font-black text-blue-700">{mitras.find(m => m.id === o.mitra_id)?.nama_lengkap}</span><button onClick={() => batalkanTugas(o.id)} className="p-2 bg-red-100 text-red-600 rounded-lg"><XOctagon size={16}/></button></div>)}</td></tr> )
                })}
                </tbody></table></div>
             </div>
          )}

          {activeTab === 'mitra' && (
             <div className="animate-in fade-in space-y-8"><h2 className="text-2xl font-black italic uppercase">Manajemen Pasukan</h2>
             <div className="bg-white p-6 rounded-3xl border-2"><div className="grid grid-cols-6 gap-4"><input value={newMitra.nama_lengkap} onChange={e => setNewMitra({...newMitra, nama_lengkap: e.target.value})} className="p-3 border-2 rounded-xl text-sm col-span-2" placeholder="Nama Lengkap" /><input value={newMitra.no_wa} onChange={e => setNewMitra({...newMitra, no_wa: e.target.value})} className="p-3 border-2 rounded-xl text-sm col-span-2" placeholder="No. WA (08...)" /><input type="text" value={newMitra.password} onChange={e => setNewMitra({...newMitra, password: e.target.value})} className="p-3 border-2 rounded-xl text-sm col-span-2 bg-blue-50" placeholder="Buat Password" /><select value={newMitra.keahlian} onChange={e => setNewMitra({...newMitra, keahlian: e.target.value})} className="p-3 border-2 border-blue-200 rounded-xl text-sm font-black col-span-2 text-slate-700"><option value="Setrika & Cleaning">Setrika & Cleaning</option><option value="Jasa Setrika">Jasa Setrika Saja</option><option value="Cleaning Service">Cleaning Service Saja</option></select><button onClick={tambahMitra} className="bg-slate-900 text-white font-black text-xs uppercase rounded-xl col-span-2 shadow-lg">Daftar Ksatria</button></div></div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mitras.map(m => (
                  <div key={m.id} className={`bg-white p-6 rounded-3xl border-2 transition-all ${m.status === 'suspend' ? 'opacity-60 bg-slate-100 grayscale' : 'shadow-sm'}`}>
                    <div className="flex justify-between mb-4">
                       <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-xl">{m.nama_lengkap.charAt(0)}</div>
                       <div className="flex gap-2">
                          <button onClick={() => { setEditingMitraId(m.id); setTempKeahlian(m.keahlian); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit size={16}/></button>
                          <button onClick={() => toggleStatusMitra(m.id, m.status)} className={`p-2 rounded-lg ${m.status === 'suspend' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}><ShieldAlert size={16}/></button>
                          <button onClick={() => hapusMitra(m.id)} className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={16}/></button>
                       </div>
                    </div>
                    <h4 className="font-black text-lg leading-tight mb-1">{m.nama_lengkap}</h4>
                    
                    {editingMitraId === m.id ? (
                        <div className="mt-3 flex gap-2">
                           <select value={tempKeahlian} onChange={(e) => setTempKeahlian(e.target.value)} className="text-[10px] p-1 border rounded font-black outline-none flex-1">
                              <option value="Setrika & Cleaning">Setrika & Cleaning</option>
                              <option value="Jasa Setrika">Jasa Setrika</option>
                              <option value="Cleaning Service">Cleaning Service</option>
                           </select>
                           <button onClick={() => updateKeahlianMitra(m.id)} className="p-1 bg-green-500 text-white rounded"><Check size={14}/></button>
                           <button onClick={() => setEditingMitraId(null)} className="p-1 bg-slate-400 text-white rounded"><X size={14}/></button>
                        </div>
                    ) : (
                        <p className="text-[10px] font-black px-2 py-1 rounded bg-blue-100 text-blue-700 inline-block uppercase mt-2 tracking-tighter italic border border-blue-200">{m.keahlian}</p>
                    )}
                    
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-dashed">
                       <div><p className="text-[9px] font-black text-slate-400 uppercase">Status</p><p className={`text-[10px] font-black uppercase ${m.status === 'suspend' ? 'text-red-600' : 'text-green-600'}`}>{m.status}</p></div>
                       <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase">Saldo</p><p className="text-sm font-black text-blue-800">Rp {getSaldo(m).toLocaleString('id-ID')}</p></div>
                    </div>
                  </div>
                ))}
             </div>
             </div>
          )}

          {activeTab === 'affiliator' && (
             <div className="animate-in fade-in space-y-8">
               <h2 className="text-2xl font-black italic uppercase">Afiliator (AFL)</h2>
               <div className="bg-white p-6 rounded-3xl border-2 grid grid-cols-1 md:grid-cols-5 gap-4">
                 <input value={newAFL.nama} onChange={e=>setNewAFL({...newAFL, nama:e.target.value})} className="p-3 border-2 rounded-xl font-bold text-sm" placeholder="Nama Afiliator" />
                 <input value={newAFL.ig} onChange={e=>setNewAFL({...newAFL, ig:e.target.value})} className="p-3 border-2 rounded-xl font-bold text-sm" placeholder="Username IG" />
                 <select value={newAFL.level} onChange={e=>setNewAFL({...newAFL, level:e.target.value})} className="p-3 border-2 rounded-xl font-bold text-sm">
                   <option value="AFLPro">AFLPro (10k)</option>
                   <option value="AFLMicro">AFLMicro (5k)</option>
                   <option value="AFLNano">AFLNano (2.5k)</option>
                 </select>
                 <input value={newAFL.kode} onChange={e=>setNewAFL({...newAFL, kode:e.target.value})} className="p-3 border-2 rounded-xl font-black text-sm uppercase text-orange-600" placeholder="KODE REFERRAL" />
                 <button onClick={tambahAFL} className="bg-slate-900 text-white font-black rounded-xl shadow-lg">DAFTAR AFL</button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {affiliates.map(a => (
                   <div key={a.id} className={`bg-white p-6 rounded-3xl border-2 transition-all ${a.status === 'nonaktif' ? 'opacity-50 grayscale bg-slate-100' : 'shadow-sm'}`}>
                     <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-black px-2 py-1 bg-slate-900 text-white rounded uppercase tracking-widest">{a.level}</span>
                       <button onClick={() => toggleStatusAFL(a.id, a.status || 'aktif', a.kode_referral)} className={`p-2 border-2 rounded-lg transition-colors ${a.status === 'aktif' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                         <Power size={16}/>
                       </button>
                     </div>
                     <h4 className="font-black text-xl leading-tight mb-1">{a.nama_afiliator}</h4>
                     <p className="text-[10px] font-bold text-slate-500 mb-4">IG: @{a.username_ig}</p>
                     
                     <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl mb-4">
                        <p className="text-[9px] font-black text-orange-800 uppercase tracking-widest mb-1">Kode Referral</p>
                        <p className="font-black text-lg text-orange-600">{a.kode_referral}</p>
                     </div>
                     
                     <div className="flex justify-between items-center pt-3 border-t border-dashed">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Status: <span className={a.status === 'aktif' ? 'text-green-600' : 'text-red-600'}>{a.status}</span></p>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Promo: <span className="text-blue-600">Rp {a.nilai_promo?.toLocaleString('id-ID')}</span></p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {activeTab === 'bukukas' && (
             <div className="animate-in fade-in space-y-8">
                <h2 className="text-2xl font-black italic uppercase">Buku Kas & GL</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-white p-6 rounded-3xl border-2"><p className="text-[10px] font-black uppercase text-slate-500">Saldo Kas Tunai</p><h3 className="text-2xl font-black text-blue-600">Rp {saldoTunai.toLocaleString('id-ID')}</h3></div><div className="bg-white p-6 rounded-3xl border-2"><p className="text-[10px] font-black uppercase text-slate-500">Rek. Pendapatan</p><h3 className="text-2xl font-black text-green-600">Rp {saldoPendapatan.toLocaleString('id-ID')}</h3></div><div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl"><p className="text-[10px] font-black uppercase text-slate-400">Titipan Deposito Mitra</p><h3 className="text-2xl font-black text-orange-400">Rp {saldoDeposito.toLocaleString('id-ID')}</h3></div></div>
                <section className="bg-white p-8 rounded-3xl border-2 mb-6">
                   <h3 className="font-black text-lg mb-6 flex items-center gap-2"><PlusCircle size={20}/> Input Transaksi Manual</h3>
                   <div className="grid grid-cols-5 gap-4"><select value={newCashEntry.tipe} onChange={e=>setNewCashEntry({...newCashEntry, tipe:e.target.value})} className="p-3 border-2 rounded-xl font-bold"><option value="MASUK">MASUK (+)</option><option value="KELUAR">KELUAR (-)</option></select><select value={newCashEntry.sumber} onChange={e=>setNewCashEntry({...newCashEntry, sumber:e.target.value})} className="p-3 border-2 rounded-xl font-bold"><option>Kas Tunai</option><option>Rek. Pendapatan</option></select><select value={newCashEntry.kategori} onChange={e=>setNewCashEntry({...newCashEntry, kategori:e.target.value})} className="p-3 border-2 rounded-xl font-bold"><option>Komisi Perusahaan</option><option>Operasional</option><option>Penjualan Produk</option></select><input type="number" value={newCashEntry.nominal} onChange={e=>setNewCashEntry({...newCashEntry, nominal:e.target.value})} className="p-3 border-2 rounded-xl font-black" placeholder="Nominal" /><input value={newCashEntry.keterangan} onChange={e=>setNewCashEntry({...newCashEntry, keterangan:e.target.value})} className="p-3 border-2 rounded-xl font-bold" placeholder="Keterangan..." /></div>
                   <button onClick={inputBukuKas} className="w-full mt-4 bg-blue-600 text-white font-black py-4 rounded-xl shadow-md">SIMPAN BUKU KAS</button>
                </section>
                <div className="bg-white rounded-3xl border-2 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-200 text-xs font-black uppercase"><tr><th className="px-6 py-4">Waktu</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4">Keterangan</th><th className="px-6 py-4">Nominal</th><th className="px-6 py-4">Status</th></tr></thead><tbody className="divide-y-2">{cashBook.map(c => (<tr key={c.id} className="hover:bg-slate-50"><td className="px-6 py-4 text-[10px] font-bold text-slate-500">{new Date(c.tanggal).toLocaleString('id-ID')}</td><td className="px-6 py-4 text-xs font-black">{c.kategori_modul}</td><td className="px-6 py-4 text-xs font-bold text-slate-600">{c.keterangan}</td><td className="px-6 py-4 font-black text-sm">{c.tipe_arus === 'MASUK' ? '+' : '-'} Rp {c.nominal.toLocaleString('id-ID')}</td><td className="px-6 py-4">{c.status_approval === 'PENDING' ? (<button onClick={() => approveTransaksi(c.id)} className="bg-orange-100 text-orange-700 px-3 py-1 rounded font-black text-[9px] uppercase border border-orange-300 hover:bg-orange-200">Approve</button>) : (<span className="text-green-600 font-black text-[9px] uppercase flex items-center gap-1"><BadgeCheck size={12}/> Verified</span>)}</td></tr>))}</tbody></table></div>
             </div>
          )}

          {activeTab === 'keuangan' && (
             <div className="animate-in fade-in space-y-8"><h2 className="text-2xl font-black italic uppercase">Analitik & Top Up</h2>
             <div className="flex gap-4 p-4 bg-white rounded-2xl border-2"><select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="flex-1 p-3 bg-slate-100 border-2 rounded-xl font-black outline-none"><option value="semua">Semua Waktu</option><option value="hari">Hari Ini</option><option value="minggu">7 Hari Terakhir</option><option value="bulan">Bulan Ini</option></select><select value={mitraFilter} onChange={(e) => setMitraFilter(e.target.value)} className="flex-1 p-3 bg-slate-100 border-2 rounded-xl font-black outline-none"><option value="semua">Semua Ksatria</option>{mitras.map(m => <option key={m.id} value={m.id}>{m.nama_lengkap}</option>)}</select></div>
             <div className="grid grid-cols-2 gap-8"><div className="bg-white rounded-3xl border-2 h-fit"><div className="p-4 bg-slate-100 font-black text-xs uppercase tracking-widest border-b-2">Top Up Dompet</div>{mitras.map(m => { const saldo = getSaldo(m); return ( <div key={m.id} className="p-4"><div className="flex justify-between mb-2"><p className="font-black text-sm">{m.nama_lengkap}</p><p className={`text-xs font-black ${saldo < 25000 ? 'text-red-600' : 'text-blue-700'}`}>Rp {saldo.toLocaleString('id-ID')}</p></div><button onClick={() => handleTopUp(m.id, m.nama_lengkap, saldo)} className="w-full bg-slate-900 text-white py-2 rounded-xl font-black text-[10px]">+ TOP UP</button></div> )})}</div><div className="bg-white rounded-3xl border-2 overflow-hidden h-fit"><table className="w-full text-left"><thead className="bg-slate-200 text-xs font-black uppercase"><tr><th className="px-6 py-4">Ksatria</th><th className="px-6 py-4">Nominal Mutasi</th></tr></thead><tbody className="divide-y-2">{filteredTransactions.map(t => (<tr key={t.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-black text-sm"><p>{t.mitra?.nama_lengkap}</p><p className="text-[10px] text-slate-400 font-bold">{t.keterangan}</p></td><td className="px-6 py-4 font-black text-slate-900">Rp {t.nominal?.toLocaleString('id-ID')}</td></tr>))}</tbody></table></div></div></div>
          )}
        </div>
      </main>
    </div>
  );
}
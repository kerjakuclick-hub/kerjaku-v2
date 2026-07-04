#!/bin/bash

echo "🚀 [SPRINT 4] Membangun Dashboard Role-Based..."
echo "======================================================================="

# Buat direktori jika belum ada
mkdir -p app/app/customer app/app/ksatria app/app/admin components/layouts

# 1. GENERATE: Protected App Layout (Sidebar & Topbar)
echo "🖼️ 1. Membuat Layout Dashboard Utama (app/app/layout.tsx)..."
cat << 'EOF' > app/app/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/features/auth/services/auth-actions'
import { LogOut, Home, User, ClipboardList, Wallet, Users } from 'lucide-react'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Jika tidak ada session, kembalikan ke gerbang login
  if (!user) return redirect('/login')

  // Tarik data profil untuk Role & Nama
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Sederhana */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black italic text-blue-500 tracking-tight">kerjaKU</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
            {profile?.role === 'super_admin' ? 'Super Admin' : profile?.role} Panel
          </p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <a href={`/app/${profile?.role}`} className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20">
            <Home size={18} /> Beranda
          </a>
          
          {/* Contoh Menu Spesifik Klien */}
          {profile?.role === 'customer' && (
             <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-bold transition-all">
               <ClipboardList size={18} /> Pesanan Saya
             </a>
          )}

          {/* Contoh Menu Spesifik Ksatria */}
          {profile?.role === 'ksatria' && (
             <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-bold transition-all">
               <Wallet size={18} /> Saldo & Deposit
             </a>
          )}

          {/* Contoh Menu Spesifik Admin */}
          {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
             <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-bold transition-all">
               <Users size={18} /> Manajemen Pasukan
             </a>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
           <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-black text-blue-400 uppercase border border-slate-700">
                 {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{profile?.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{profile?.phone_number}</p>
              </div>
           </div>
           <form action={logout}>
             <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-bold transition-all">
               <LogOut size={16} /> Keluar
             </button>
           </form>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
           <p className="text-sm font-bold text-slate-500 capitalize">Selamat datang kembali, {profile?.full_name?.split(' ')[0]}!</p>
        </header>
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
EOF

# 2. GENERATE: Customer Dashboard
echo "👤 2. Membuat Dashboard Customer (app/app/customer/page.tsx)..."
cat << 'EOF' > app/app/customer/page.tsx
import { Zap } from 'lucide-react'

export default function CustomerDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black text-slate-800">Beranda Klien</h1>
      
      <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <h2 className="text-2xl font-bold mb-2">Butuh Bantuan Apa Hari Ini?</h2>
        <p className="text-blue-100 mb-6 max-w-md">Pesan layanan kebersihan atau jasa setrika, Ksatria kami siap meluncur ke lokasi Anda.</p>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg">
          <Zap size={18} /> Buat Pesanan Baru
        </button>
      </div>
    </div>
  )
}
EOF

# 3. GENERATE: Ksatria Dashboard
echo "🛡️ 3. Membuat Dashboard Ksatria (app/app/ksatria/page.tsx)..."
cat << 'EOF' > app/app/ksatria/page.tsx
import { Wallet, ClipboardList } from 'lucide-react'

export default function KsatriaDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black text-slate-800">Ruang Ksatria</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center gap-6">
           <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl"><ClipboardList size={32} /></div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tugas Hari Ini</p>
             <p className="text-3xl font-black text-slate-800 mt-1">0</p>
           </div>
         </div>
         <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center gap-6">
           <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Wallet size={32} /></div>
           <div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Deposit</p>
             <p className="text-3xl font-black text-slate-800 mt-1">Rp 0</p>
           </div>
         </div>
      </div>

      <div className="p-8 bg-slate-900 rounded-[2rem] text-white text-center mt-8">
        <p className="text-slate-400 font-medium">Standby... Belum ada tugas yang dialokasikan untuk Anda saat ini.</p>
      </div>
    </div>
  )
}
EOF

# 4. GENERATE: Admin Dashboard
echo "👑 4. Membuat Dashboard Admin (app/app/admin/page.tsx)..."
cat << 'EOF' > app/app/admin/page.tsx
export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black text-slate-800 italic uppercase">Ruang Komando</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pesanan Aktif</p>
           <p className="text-4xl font-black text-slate-800 mt-2">0</p>
         </div>
         <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-200">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-green-600">Ksatria Online</p>
           <p className="text-4xl font-black text-slate-800 mt-2">0</p>
         </div>
         <div className="p-6 bg-slate-900 rounded-3xl shadow-lg border border-slate-800 text-white">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendapatan Hari Ini</p>
           <p className="text-3xl font-black mt-2 text-blue-400">Rp 0</p>
         </div>
      </div>
    </div>
  )
}
EOF


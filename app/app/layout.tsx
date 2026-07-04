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

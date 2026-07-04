import { signup } from '@/features/auth/services/auth-actions'
import Link from 'next/link'

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  const params = await searchParams;
  
  return (
    <form action={signup} className="mt-8 space-y-5">
      {params?.message && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold text-center">
          {params.message}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
          <input name="fullName" type="text" required className="w-full p-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600" placeholder="Budi Santoso" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1">No. WhatsApp</label>
          <input name="phone" type="tel" required className="w-full p-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600" placeholder="081234567890" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
          <input name="email" type="email" required className="w-full p-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600" placeholder="budi@email.com" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
          <input name="password" type="password" required className="w-full p-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600" placeholder="Minimal 6 karakter" minLength={6} />
        </div>
      </div>

      {/* Secara default mendaftar sebagai Klien. Nanti Admin bisa ubah Role di Dashboard System */}
      <input type="hidden" name="role" value="customer" />

      <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] mt-2">
        Buat Akun
      </button>
      
      <p className="text-center text-sm text-slate-500 font-medium pt-2">
        Sudah punya akun? <Link href="/login" className="text-blue-600 hover:underline font-bold">Masuk di sini</Link>
      </p>
    </form>
  )
}

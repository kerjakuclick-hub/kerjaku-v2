import { login } from '@/features/auth/services/auth-actions'
import Link from 'next/link'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message: string }> }) {
  const params = await searchParams;
  
  return (
    <form action={login} className="mt-8 space-y-6">
      {params?.message && (
        <div className="p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-sm font-bold text-center">
          {params.message}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
          <input name="email" type="email" required className="w-full p-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all" placeholder="contoh@email.com" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
          <input name="password" type="password" required className="w-full p-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all" placeholder="••••••••" />
        </div>
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]">
        Masuk Ruang Komando
      </button>
      <p className="text-center text-sm text-slate-500 font-medium">
        Belum punya akun? <Link href="/register" className="text-blue-600 hover:underline font-bold">Daftar sekarang</Link>
      </p>
    </form>
  )
}

import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 italic tracking-tight">kerjaKU<span className="text-slate-800">.click</span></h1>
          <p className="mt-2 text-sm text-slate-500">Urusan rumah jadi mudah.</p>
        </div>
        {children}
      </div>
    </div>
  )
}

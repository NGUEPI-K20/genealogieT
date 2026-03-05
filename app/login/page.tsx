'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Identifiants incorrects. Réessayez.')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0E0D0B] flex items-center justify-center relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,146,42,0.04) 0%, transparent 70%)' }}
      />

      <div className="w-[380px] relative z-10">
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[#7A7268] font-mono text-[0.68rem] tracking-[0.1em] mb-8 hover:text-[#E8E0D0] transition-colors"
        >
          ← Retour au site
        </Link>

        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-12 h-12 rounded-full border border-[#8B6420] flex items-center justify-center mx-auto mb-4 font-playfair text-xl text-[#C8922A]">
            D
          </div>
          <h1 className="font-playfair text-[1.4rem] text-[#E8E0D0] mb-1">
            Espace Administration
          </h1>
          <p className="font-mono text-[0.72rem] tracking-[0.2em] uppercase text-[#7A7268]">
            Famille Dumont · Archives
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-mono text-[0.68rem] tracking-[0.15em] uppercase text-[#7A7268] mb-2">
              Identifiant
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@dumont.fr"
              required
              className="w-full bg-[#1E1C18] border border-[#2E2B25] text-[#E8E0D0] px-4 py-3 font-mono text-[0.9rem] rounded-[3px] outline-none focus:border-[#8B6420] transition-colors placeholder:text-[#4A4640]"
            />
          </div>

          <div>
            <label className="block font-mono text-[0.68rem] tracking-[0.15em] uppercase text-[#7A7268] mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#1E1C18] border border-[#2E2B25] text-[#E8E0D0] px-4 py-3 font-mono text-[0.9rem] rounded-[3px] outline-none focus:border-[#8B6420] transition-colors placeholder:text-[#4A4640]"
            />
          </div>

          {error && (
            <p className="text-[#C85A3D] font-mono text-[0.72rem]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C8922A] text-[#0E0D0B] py-3 font-playfair text-[0.9rem] tracking-wide rounded-[3px] hover:bg-[#D9A040] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Connexion…' : 'Accéder à l\'administration'}
          </button>
        </form>
      </div>
    </div>
  )
}

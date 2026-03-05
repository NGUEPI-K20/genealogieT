'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLogout() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full border border-[#2E2B25] text-[#7A7268] py-1.5 font-mono text-[0.72rem] tracking-[0.08em] rounded-[3px] hover:border-[#C85A3D] hover:text-[#C85A3D] transition-all"
    >
      ← Se déconnecter
    </button>
  )
}

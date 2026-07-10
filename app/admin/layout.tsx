import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PEOPLE } from '@/lib/data'
import AdminLogout from '@/components/Admin/AdminLogout'

async function getMemberCount(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes('xxxx')) return PEOPLE.length
  try {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('persons')
      .select('id', { count: 'exact', head: true })
    if (error || count === null) return PEOPLE.length
    return count
  } catch {
    return PEOPLE.length
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const memberCount = await getMemberCount()

  const navItems = [
    { href: '/admin', label: 'Tableau de bord', icon: '⊞' },
    { href: '/admin/membres', label: 'Membres', icon: '◈', badge: String(memberCount) },
    { href: '/admin/ajouter', label: 'Ajouter', icon: '＋' },
    { href: '/admin/relations', label: 'Relations', icon: '⟋' },
    { href: '/admin/settings', label: 'Paramètres', icon: '⚙' },
  ]

  return (
    <div className="flex h-screen bg-[#0E0D0B] text-[#E8E0D0]">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#161410] border-r border-[#2E2B25] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-7 border-b border-[#2E2B25]">
          <p className="font-playfair text-base text-[#E8E0D0]">Famille Dumont</p>
          <p className="font-mono text-[0.62rem] tracking-[0.18em] uppercase text-[#C8922A] mt-0.5">Admin · v1.0</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="font-mono text-[0.58rem] tracking-[0.22em] uppercase text-[#4A4640] px-2 mb-2">Principal</p>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-[3px] text-[0.82rem] text-[#7A7268] hover:bg-[#1E1C18] hover:text-[#E8E0D0] transition-all mb-0.5 group"
            >
              <span className="w-[18px] text-center text-[0.9rem]">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-[#8B6420] text-[#C8922A] font-mono text-[0.6rem] px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[#2E2B25]">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#8B6420] flex items-center justify-center font-playfair text-[0.7rem] text-[#C8922A] flex-shrink-0">
              A
            </div>
            <div>
              <p className="text-[0.78rem] text-[#E8E0D0]">{user.email?.split('@')[0]}</p>
              <p className="font-mono text-[0.62rem] text-[#7A7268]">administrateur</p>
            </div>
          </div>
          <AdminLogout />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-[60px] border-b border-[#2E2B25] flex items-center px-8 gap-4 flex-shrink-0">
          <div className="flex-1" />
          <Link
            href="/"
            className="border border-[#2E2B25] text-[#7A7268] px-3.5 py-1.5 font-mono text-[0.68rem] tracking-[0.1em] rounded-[3px] hover:border-[#8B6420] hover:text-[#C8922A] transition-all"
          >
            ← Voir le site
          </Link>
          <Link
            href="/admin/ajouter"
            className="bg-[#C8922A] text-[#0E0D0B] px-4 py-2 font-playfair text-[0.8rem] rounded-[3px] hover:bg-[#D9A040] transition-colors"
          >
            ＋ Nouveau membre
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

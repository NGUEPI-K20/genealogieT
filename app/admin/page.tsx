import { createClient } from '@/lib/supabase/server'
import { PEOPLE } from '@/lib/data'
import { Person } from '@/lib/types'

const GEN_LABELS = ['', 'I', 'II', 'III', 'IV', 'V']

async function getMembers(): Promise<Person[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes('xxxx')) return PEOPLE as Person[]
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('persons').select('*')
    if (error) return PEOPLE as Person[]
    return (data ?? []) as Person[]
  } catch {
    return PEOPLE as Person[]
  }
}

function computeStats(people: Person[]) {
  const alive = people.filter(p => !p.death_year).length
  const generations = people.length > 0 ? Math.max(...people.map(p => p.generation)) : 0
  const minYear = people.length > 0 ? Math.min(...people.map(p => p.birth_year)) : new Date().getFullYear()
  const yearsOfHistory = new Date().getFullYear() - minYear

  return [
    { label: 'Membres', value: people.length },
    { label: 'Générations', value: generations },
    { label: 'Vivants', value: alive, delta: people.length > 0 ? `${Math.round((alive / people.length) * 100)}%` : undefined },
    { label: "Années d'histoire", value: yearsOfHistory },
  ]
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return "Aujourd'hui"
  if (days === 1) return 'Hier'
  if (days < 14) return `Il y a ${days} jours`
  if (days < 60) return `Il y a ${Math.floor(days / 7)} semaines`
  return `Il y a ${Math.floor(days / 30)} mois`
}

function recentActivity(people: Person[]) {
  return [...people]
    .filter(p => p.created_at)
    .sort((a, b) => new Date(b.updated_at ?? b.created_at!).getTime() - new Date(a.updated_at ?? a.created_at!).getTime())
    .slice(0, 5)
    .map(p => {
      const isEdit = p.updated_at && p.created_at && p.updated_at !== p.created_at
      return {
        type: isEdit ? 'edit' : 'add',
        text: isEdit ? 'Mise à jour de' : 'Ajout de',
        name: `${p.first_name} ${p.last_name}`,
        sub: `Gen. ${GEN_LABELS[p.generation]}`,
        time: timeAgo(p.updated_at ?? p.created_at!),
      }
    })
}

export default async function AdminDashboard() {
  const members = await getMembers()
  const stats = computeStats(members)
  const activity = recentActivity(members)

  const recent = members
    .map((m, i) => ({ m, key: m.created_at ? new Date(m.created_at).getTime() : i }))
    .sort((a, b) => b.key - a.key)
    .slice(0, 5)
    .map(({ m }) => m)

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-[#161410] border border-[#2E2B25] rounded-[3px] px-5 py-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#8B6420]" />
            <p className="font-playfair text-4xl text-[#E8E0D0] leading-none mb-1.5">{s.value}</p>
            <p className="font-mono text-[0.68rem] tracking-[0.15em] uppercase text-[#7A7268]">{s.label}</p>
            {s.delta && (
              <p className="absolute top-5 right-5 font-mono text-[0.7rem] text-[#4A8B5A]">
                {s.delta}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Recent members */}
        <div className="bg-[#161410] border border-[#2E2B25] rounded-[3px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#2E2B25] flex items-center justify-between">
            <h2 className="font-playfair text-[0.9rem] text-[#E8E0D0]">Membres récents</h2>
            <a href="/admin/membres" className="font-mono text-[0.68rem] text-[#C8922A] hover:underline">
              Voir tout →
            </a>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                {['Nom', 'Génération', 'Statut', 'Lieu'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-mono text-[0.62rem] tracking-[0.18em] uppercase text-[#4A4640] border-b border-[#2E2B25] font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(m => (
                <tr key={m.id} className="hover:bg-[#1E1C18] group">
                  <td className="px-4 py-3 border-b border-[#2E2B25]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-playfair text-[0.6rem] text-[#F5F0E8] flex-shrink-0" style={{ background: m.color }}>
                        {m.initials}
                      </div>
                      <div>
                        <p className="font-playfair text-[#E8E0D0] text-sm">{m.first_name} {m.last_name}</p>
                        <p className="font-mono text-[0.68rem] text-[#7A7268]">{m.current_place}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-[#2E2B25]">
                    <span className="bg-[rgba(200,146,42,0.1)] text-[#C8922A] border border-[rgba(200,146,42,0.2)] font-mono text-[0.62rem] px-2 py-0.5 rounded-sm">
                      Gen. {GEN_LABELS[m.generation]}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-[#2E2B25]">
                    <span className={`font-mono text-[0.62rem] px-2 py-0.5 rounded-sm border ${m.death_year ? 'bg-[rgba(74,70,64,0.3)] text-[#4A4640] border-[#2E2B25]' : 'bg-[rgba(74,139,90,0.15)] text-[#4A8B5A] border-[rgba(74,139,90,0.2)]'}`}>
                      {m.death_year ? 'Décédé' : 'Vivant'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-[#2E2B25] text-[0.78rem] text-[#7A7268]">
                    {m.current_place}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center font-mono text-[0.75rem] text-[#4A4640]">
                    Aucun membre
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Activity */}
        <div className="bg-[#161410] border border-[#2E2B25] rounded-[3px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#2E2B25]">
            <h2 className="font-playfair text-[0.9rem] text-[#E8E0D0]">Activité récente</h2>
          </div>
          <div>
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3 px-5 py-3 border-b border-[#2E2B25] last:border-b-0 items-start">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.type === 'add' ? 'bg-[#4A8B5A]' : 'bg-[#C8922A]'}`} />
                <div>
                  <p className="text-[0.8rem] text-[#7A7268] leading-snug">
                    {a.text} <span className="font-playfair text-[#E8E0D0]">{a.name}</span> — {a.sub}
                  </p>
                  <p className="font-mono text-[0.65rem] text-[#4A4640] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
            {activity.length === 0 && (
              <p className="px-5 py-8 text-center font-mono text-[0.72rem] text-[#4A4640]">
                Aucune activité récente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { PEOPLE, RELATIONS } from '@/lib/data'

const stats = [
  { label: 'Membres', value: 28, delta: '+2 ce mois' },
  { label: 'Générations', value: 5 },
  { label: 'Vivants', value: 17, delta: '61%', deltaGreen: true },
  { label: "Années d'histoire", value: 132 },
]

const activity = [
  { type: 'add', text: 'Ajout de', name: 'Mia Vidal', sub: 'Gen. V', time: 'Il y a 3 jours' },
  { type: 'edit', text: 'Biographie de', name: 'Élise Bertrand', sub: 'mise à jour', time: 'Il y a 5 jours' },
  { type: 'add', text: 'Ajout de', name: 'Lucas Dumont', sub: 'Gen. IV', time: 'Il y a 2 semaines' },
]

export default function AdminDashboard() {
  const recent = PEOPLE.slice(-5).reverse()

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
              <p className={`absolute top-5 right-5 font-mono text-[0.7rem] ${s.deltaGreen ? 'text-[#4A8B5A]' : 'text-[#4A8B5A]'}`}>
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
                      Gen. {['','I','II','III','IV','V'][m.generation]}
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
          </div>
        </div>
      </div>
    </div>
  )
}

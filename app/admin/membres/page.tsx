import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PEOPLE } from '@/lib/data'
import { Person } from '@/lib/types'
import DeleteButton from './DeleteButton'

const ROMANS = ['', 'I', 'II', 'III', 'IV', 'V']

async function getMembers(): Promise<Person[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes('xxxx')) return PEOPLE as Person[]
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .order('generation')
      .order('birth_year')
    if (error) return PEOPLE as Person[]
    return (data ?? []) as Person[]
  } catch {
    return PEOPLE as Person[]
  }
}

export default async function MembresPage() {
  const members = await getMembers()

  return (
    <div>
      <div className="bg-[#161410] border border-[#2E2B25] rounded-[3px] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#2E2B25] flex items-center justify-between">
          <h2 className="font-playfair text-[0.9rem] text-[#E8E0D0]">
            Tous les membres
            <span className="ml-2 font-mono text-[0.68rem] text-[#7A7268]">({members.length})</span>
          </h2>
          <span className="font-mono text-[0.68rem] text-[#C8922A] cursor-pointer hover:underline">
            Exporter CSV
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              {['Nom', 'Naissance', 'Décès', 'Génération', 'Statut', 'Lieu', 'Actions'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-mono text-[0.62rem] tracking-[0.18em] uppercase text-[#4A4640] border-b border-[#2E2B25] font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} className="hover:bg-[#1E1C18] group">
                <td className="px-4 py-3 border-b border-[#2E2B25]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-playfair text-[0.6rem] text-[#F5F0E8] flex-shrink-0" style={{ background: m.color }}>
                      {m.initials}
                    </div>
                    <div>
                      <p className="font-playfair text-[#E8E0D0] text-sm">{m.first_name} {m.last_name}</p>
                      {m.birth_name && <p className="font-mono text-[0.62rem] text-[#7A7268] italic">née {m.birth_name}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 border-b border-[#2E2B25] font-mono text-[0.75rem] text-[#7A7268]">
                  {m.birth_year}
                  {m.birth_place && <span className="block text-[0.62rem] text-[#4A4640]">{m.birth_place}</span>}
                </td>
                <td className="px-4 py-3 border-b border-[#2E2B25] font-mono text-[0.75rem] text-[#7A7268]">{m.death_year ?? '—'}</td>
                <td className="px-4 py-3 border-b border-[#2E2B25]">
                  <span className="bg-[rgba(200,146,42,0.1)] text-[#C8922A] border border-[rgba(200,146,42,0.2)] font-mono text-[0.62rem] px-2 py-0.5 rounded-sm">
                    Gen. {ROMANS[m.generation]}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-[#2E2B25]">
                  <span className={`font-mono text-[0.62rem] px-2 py-0.5 rounded-sm border ${m.death_year ? 'bg-[rgba(74,70,64,0.3)] text-[#4A4640] border-[#2E2B25]' : 'bg-[rgba(74,139,90,0.15)] text-[#4A8B5A] border-[rgba(74,139,90,0.2)]'}`}>
                    {m.death_year ? 'Décédé' : 'Vivant'}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-[#2E2B25] text-[0.78rem] text-[#7A7268]">{m.current_place ?? '—'}</td>
                <td className="px-4 py-3 border-b border-[#2E2B25]">
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/ajouter?id=${m.id}`}
                      className="w-7 h-7 bg-[#252220] border border-[#2E2B25] text-[#7A7268] rounded-[3px] flex items-center justify-center text-[0.75rem] hover:border-[#8B6420] hover:text-[#C8922A] transition-all"
                      title="Modifier">
                      ✎
                    </Link>
                    <DeleteButton id={m.id} name={`${m.first_name} ${m.last_name}`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && (
          <div className="py-16 text-center font-mono text-[0.78rem] text-[#4A4640]">
            Aucun membre · <Link href="/admin/ajouter" className="text-[#C8922A] hover:underline">Ajouter le premier</Link>
          </div>
        )}
      </div>
    </div>
  )
}

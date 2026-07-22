import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PEOPLE, RELATIONS } from '@/lib/data'
import { Person, Relation } from '@/lib/types'

async function getData(): Promise<{ people: Person[]; relations: Relation[] }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes('xxxx')) return { people: PEOPLE, relations: RELATIONS }

  try {
    const supabase = await createClient()
    const [{ data: people, error: pErr }, { data: relations, error: rErr }] =
      await Promise.all([
        supabase.from('persons').select('id, first_name, last_name, generation, color, initials'),
        supabase.from('relations').select('*').order('created_at', { ascending: false }),
      ])
    if (pErr || rErr) return { people: PEOPLE, relations: RELATIONS }
    return {
      people: (people ?? []) as Person[],
      relations: (relations ?? []) as Relation[],
    }
  } catch {
    return { people: PEOPLE, relations: RELATIONS }
  }
}

const TYPE_LABELS: Record<Relation['type'], string> = {
  parent: 'Filiation',
  union: 'Union',
}

export default async function RelationsPage() {
  const { people, relations } = await getData()
  const byId = new Map(people.map(p => [p.id, p]))

  return (
    <div>
      <div className="bg-[#161410] border border-[#2E2B25] rounded-[3px] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#2E2B25] flex items-center justify-between">
          <h2 className="font-playfair text-[0.9rem] text-[#E8E0D0]">
            Toutes les relations
            <span className="ml-2 font-mono text-[0.68rem] text-[#7A7268]">({relations.length})</span>
          </h2>
          <p className="font-mono text-[0.65rem] text-[#4A4640] italic">
            Ajout / modification depuis la fiche membre
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              {['Membre A', 'Type', 'Membre B', 'Depuis'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left font-mono text-[0.62rem] tracking-[0.18em] uppercase text-[#4A4640] border-b border-[#2E2B25] font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {relations.map(r => {
              const a = byId.get(r.person_a_id)
              const b = byId.get(r.person_b_id)
              return (
                <tr key={r.id} className="hover:bg-[#1E1C18]">
                  <td className="px-4 py-3 border-b border-[#2E2B25]">
                    {a ? (
                      <Link href={`/admin/ajouter?id=${a.id}`} className="font-playfair text-[#E8E0D0] text-sm hover:text-[#D4A017]">
                        {a.first_name} {a.last_name}
                      </Link>
                    ) : (
                      <span className="font-mono text-[0.72rem] text-[#4A4640] italic">{r.person_a_id}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-[#2E2B25]">
                    <span className="bg-[rgba(200,146,42,0.1)] text-[#D4A017] border border-[rgba(200,146,42,0.2)] font-mono text-[0.62rem] px-2 py-0.5 rounded-sm">
                      {TYPE_LABELS[r.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-[#2E2B25]">
                    {b ? (
                      <Link href={`/admin/ajouter?id=${b.id}`} className="font-playfair text-[#E8E0D0] text-sm hover:text-[#D4A017]">
                        {b.first_name} {b.last_name}
                      </Link>
                    ) : (
                      <span className="font-mono text-[0.72rem] text-[#4A4640] italic">{r.person_b_id}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-[#2E2B25] font-mono text-[0.75rem] text-[#7A7268]">
                    {r.since_year ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {relations.length === 0 && (
          <div className="py-16 text-center font-mono text-[0.78rem] text-[#4A4640]">
            Aucune relation enregistrée
          </div>
        )}
      </div>
    </div>
  )
}

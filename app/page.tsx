import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PEOPLE, RELATIONS } from '@/lib/data'
import { Person, Relation } from '@/lib/types'
import FamilyTree from '@/components/Tree/FamilyTree'

// Récupère les données depuis Supabase.
// Si Supabase n'est pas encore configuré (variables d'env manquantes),
// on retombe gracieusement sur les données statiques de lib/data.ts.
async function getData(): Promise<{ people: Person[]; relations: Relation[] }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Fallback sur les données statiques si Supabase n'est pas configuré
  if (!url || !key || url.includes('xxxx')) {
    return { people: PEOPLE, relations: RELATIONS }
  }

  try {
    const supabase = await createClient()

    const [{ data: people, error: pErr }, { data: relations, error: rErr }] =
      await Promise.all([
        supabase.from('persons').select('*').order('generation').order('birth_year'),
        supabase.from('relations').select('*').order('created_at'),
      ])

    if (pErr || rErr) {
      console.error('Supabase error:', pErr ?? rErr)
      return { people: PEOPLE, relations: RELATIONS }
    }

    return {
      people: (people ?? []) as Person[],
      relations: (relations ?? []) as Relation[],
    }
  } catch (err) {
    console.error('Supabase connexion échouée, fallback sur données statiques:', err)
    return { people: PEOPLE, relations: RELATIONS }
  }
}

// Calcule quelques stats dynamiques pour le header
function computeStats(people: Person[]) {
  const alive = people.filter(p => !p.death_year).length
  const generations = (people.length > 0 ? Math.max(...people.map(p => p.generation)) : 0) as 1 | 2 | 3 | 4 | 5
  const maxYear = new Date().getFullYear()
  const minYear = people.length > 0 ? Math.min(...people.map(p => p.birth_year)) : maxYear
  return { total: people.length, alive, generations, minYear, maxYear }
}

export default async function Home() {
  const { people, relations } = await getData()
  const stats = computeStats(people)

  return (
    <main className="w-full h-screen relative overflow-hidden bg-[#F5F0E8]">

      {/* ── Grain texture overlay ─────────────────────────── */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-10 opacity-60"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Header ───────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-10 py-5"
        style={{ background: 'linear-gradient(to bottom, #F5F0E8 70%, transparent)' }}
      >
        {/* Left — titre */}
        <div>
          <h1 className="font-playfair text-2xl font-bold tracking-wide text-[#1C1A16]">
            Famille{' '}
            <span className="font-normal italic text-[#A81C1C]">Nguepi</span>
          </h1>
          <p className="text-[0.75rem] tracking-[0.2em] uppercase text-[#4A4540] mt-0.5">
            Arbre Généalogique · {stats.minYear} — {stats.maxYear}
          </p>
        </div>

        {/* Right — stats + lien admin */}
        <div className="flex items-center gap-5">
          {/* Stats en ligne */}
          <div className="hidden sm:flex items-center gap-5 text-[0.72rem] font-mono text-[#7A7268]">
            <span>
              <span className="font-playfair text-[#1C1A16] text-sm mr-1">{stats.total}</span>
              membres
            </span>
            <span className="text-[#C8B89A]">·</span>
            <span>
              <span className="font-playfair text-[#1C1A16] text-sm mr-1">{stats.alive}</span>
              vivants
            </span>
            <span className="text-[#C8B89A]">·</span>
            <span className="font-playfair italic text-[0.9rem] text-[#A81C1C] border-l border-[#C8B89A] pl-5">
              {stats.generations} générations
            </span>
          </div>

          {/* Bouton admin */}
          <Link
            href="/login"
            className="
              border border-[#D4A017]/50 text-[#4A4540]
              px-3.5 py-1.5 text-[0.65rem] tracking-[0.12em] uppercase
              font-mono rounded-[3px]
              hover:border-[#A81C1C] hover:text-[#A81C1C]
              transition-all duration-200
            "
          >
            ⚙ Administration
          </Link>
        </div>
      </header>

      {/* ── Hint (disparaît via CSS animation) ──────────── */}
      <div
        aria-hidden
        className="
          fixed top-[90px] left-1/2 -translate-x-1/2
          bg-[rgba(28,26,22,0.75)] text-[#F5F0E8]
          px-5 py-2 rounded-full
          text-[0.7rem] tracking-[0.12em] uppercase
          z-20 pointer-events-none
        "
        style={{ animation: 'fadeOut 0.8s ease 4s forwards' }}
      >
        Cliquez sur un membre · Glissez pour naviguer · Molette pour zoomer
      </div>

      {/* ── Arbre interactif (React Flow) ────────────────── */}
      <div className="w-full h-full">
        <FamilyTree people={people} relations={relations} />
      </div>

      {/* ── Légende ──────────────────────────────────────── */}
      <div
        aria-label="Légende"
        className="fixed bottom-24 left-10 z-20 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase text-[#4A4540]">
          <div className="w-6 h-px bg-[#D4A017]" />
          Filiation
        </div>
        <div className="flex items-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase text-[#4A4540]">
          <div className="w-6 border-t border-dashed border-[#A81C1C]" />
          Union
        </div>
      </div>

      {/* ── Pied de page ─────────────────────────────────── */}
      <p className="fixed bottom-6 right-6 font-playfair italic text-[0.7rem] text-[#D4A017] tracking-wide z-20 select-none">
        © Archives Nguepi
      </p>

      {/* ── CSS keyframe pour le hint ─────────────────────── */}
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to   { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </main>
  )
}
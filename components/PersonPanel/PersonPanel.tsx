'use client'

import { Person, Relation } from '@/lib/types'

interface PersonPanelProps {
  person: Person | null
  relatedPeople: Person[]
  allRelations: Relation[]
  onClose: () => void
  onSelectPerson: (p: Person) => void
}

function getRelType(from: Person, to: Person, relations: Relation[]): string {
  const rel = relations.find(
    r => (r.person_a_id === from.id && r.person_b_id === to.id) ||
         (r.person_b_id === from.id && r.person_a_id === to.id)
  )
  if (!rel) return 'Famille'
  if (rel.type === 'union') return 'Époux / Épouse'
  const diff = to.generation - from.generation
  if (diff === 1) return 'Enfant'
  if (diff === -1) return 'Parent'
  if (diff === 2) return 'Petit-enfant'
  if (diff === -2) return 'Grand-parent'
  return 'Famille'
}

export default function PersonPanel({ person, relatedPeople, allRelations, onClose, onSelectPerson }: PersonPanelProps) {
  const isOpen = person !== null

  return (
    <div
      className={`
        absolute right-0 top-0 bottom-0 w-[340px] bg-[#1C1A16] text-[#F5F0E8]
        flex flex-col overflow-hidden z-50
        transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      style={{ transitionDuration: '400ms' }}
    >
      {person && (
        <>
          {/* Header */}
          <div className="px-9 pt-10 pb-7 border-b border-white/10 relative">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-8 h-8 rounded-full border border-[#D4A017]/30 flex items-center justify-center text-sm text-[#F5F0E8] hover:bg-[#D4A017]/10 hover:border-[#D4A017] transition-all"
            >
              ✕
            </button>

            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center font-playfair text-3xl text-[#F5F0E8] mb-5"
              style={{ background: person.color }}
            >
              {person.initials}
            </div>

            <h2 className="font-playfair text-[1.4rem] font-semibold leading-tight mb-1">
              {person.first_name}{' '}
              <em className="font-normal not-italic text-[#D4A017]">
                {person.birth_name ? `née ${person.birth_name}` : person.last_name}
              </em>
            </h2>

            <p className="text-sm text-[#D4A017] tracking-wide mb-0.5">
              {person.birth_year}{person.death_year ? ` — ${person.death_year}` : ' — présent'}
            </p>
            {person.current_place && (
              <p className="text-xs text-[#D4A017]/60 italic">{person.current_place}</p>
            )}
          </div>

          {/* Body */}
          <div className="px-9 py-7 flex-1 overflow-y-auto space-y-7">
            {/* Bio */}
            {person.bio && (
              <div>
                <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#D4A017] mb-2.5 pb-2 border-b border-white/10">
                  Biographie
                </p>
                <p className="text-[0.85rem] leading-7 text-[#F5F0E8]/75 italic">{person.bio}</p>
              </div>
            )}

            {/* État civil */}
            <div>
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#D4A017] mb-2.5 pb-2 border-b border-white/10">
                État civil
              </p>
              <div className="space-y-2">
                {person.profession && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#D4A017]/50 text-[0.7rem] tracking-wide">Profession</span>
                    <span className="font-playfair text-[#F5F0E8]">{person.profession}</span>
                  </div>
                )}
                {person.marital_status && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#D4A017]/50 text-[0.7rem] tracking-wide">Situation</span>
                    <span className="font-playfair text-[#F5F0E8]">{person.marital_status}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#D4A017]/50 text-[0.7rem] tracking-wide">Génération</span>
                  <span className="font-playfair text-[#F5F0E8]">
                    {['','I','II','III','IV','V'][person.generation]}
                  </span>
                </div>
              </div>
            </div>

            {/* Famille proche */}
            {relatedPeople.length > 0 && (
              <div>
                <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#D4A017] mb-2.5 pb-2 border-b border-white/10">
                  Famille proche
                </p>
                <div className="space-y-2">
                  {relatedPeople.map(rel => (
                    <button
                      key={rel.id}
                      onClick={() => onSelectPerson(rel)}
                      className="w-full flex items-center gap-2.5 p-2 rounded bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/20 transition-all text-left"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[0.6rem] text-[#F5F0E8] font-playfair"
                        style={{ background: rel.color }}
                      >
                        {rel.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-playfair text-[#F5F0E8] text-[0.78rem] truncate">
                          {rel.first_name} {rel.last_name}
                        </p>
                        <p className="text-[0.65rem] text-[#D4A017] italic">
                          {getRelType(person, rel, allRelations)} · {rel.birth_year}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

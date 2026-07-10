'use client'

import { useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { Person } from '@/lib/types'

const ROMANS = ['', 'I', 'II', 'III', 'IV', 'V']
const GEN_LABELS = ['', 'I · Fondateurs', 'II · Guerre', 'III · Baby-boomers', 'IV · Gen X / Y', 'V · Gen Alpha']

interface Props {
  allPersons: Pick<Person, 'id' | 'first_name' | 'last_name' | 'generation'>[]
  editPerson: Person | null
  action: (formData: FormData) => Promise<void>
}

export default function MemberFormClient({ allPersons, editPerson, action }: Props) {
  const isEdit = !!editPerson
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Preview state — initialisé depuis editPerson si mode édition
  const [prenom, setPrenom]   = useState(editPerson?.first_name  ?? '')
  const [nom, setNom]         = useState(editPerson?.last_name   ?? '')
  const [birth, setBirth]     = useState(editPerson?.birth_year?.toString() ?? '')
  const [gen, setGen]         = useState(editPerson?.generation?.toString() ?? '')

  const initials     = ((prenom[0] ?? '?') + (nom[0] ?? '')).toUpperCase()
  const previewName  = prenom || nom ? `${prenom} ${nom}`.trim() : 'Prénom Nom'
  const genNum       = parseInt(gen) || 0

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await action(formData)
      } catch (e: unknown) {
        // Next.js redirect() lance une "erreur" — on l'ignore
        const msg = e instanceof Error ? e.message : String(e)
        if (!msg.includes('NEXT_REDIRECT')) {
          setError(msg || 'Une erreur est survenue.')
        }
      }
    })
  }

  function handleReset() {
    formRef.current?.reset()
    setPrenom('')
    setNom('')
    setBirth('')
    setGen('')
    setError(null)
  }

  return (
    <div className="grid grid-cols-[1fr_290px] gap-6 max-w-[980px]">

      {/* ── Formulaire principal ──────────────────────── */}
      <form ref={formRef} action={handleSubmit}>
        {/* id caché en mode édition */}
        {isEdit && <input type="hidden" name="id" value={editPerson.id} />}

        {/* ── Bloc : Identité ── */}
        <FormCard icon="◈" title="Identité">
          <div className="grid grid-cols-2 gap-4">
            <Field name="first_name" label="Prénom *"
              defaultValue={editPerson?.first_name}
              placeholder="Marie"
              onChange={setPrenom} />
            <Field name="last_name" label="Nom *"
              defaultValue={editPerson?.last_name}
              placeholder="Dumont"
              onChange={setNom} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field name="birth_name" label="Nom de naissance"
              defaultValue={editPerson?.birth_name ?? ''}
              placeholder="née Dupont" />
            <SelectField name="gender" label="Genre"
              defaultValue={editPerson?.gender ?? ''}>
              <option value="">—</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </SelectField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field name="birth_year" label="Naissance *" type="number"
              defaultValue={editPerson?.birth_year?.toString()}
              placeholder="1952"
              onChange={setBirth} />
            <Field name="death_year" label="Décès"
              type="number"
              defaultValue={editPerson?.death_year?.toString() ?? ''}
              placeholder="— si vivant" />
            <SelectField name="generation" label="Génération *"
              defaultValue={editPerson?.generation?.toString() ?? ''}
              onChange={setGen}>
              <option value="">—</option>
              {GEN_LABELS.slice(1).map((l, i) => (
                <option key={i + 1} value={String(i + 1)}>{l}</option>
              ))}
            </SelectField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field name="birth_place" label="Lieu de naissance"
              defaultValue={editPerson?.birth_place ?? ''}
              placeholder="Bordeaux" />
            <Field name="current_place" label="Résidence actuelle"
              defaultValue={editPerson?.current_place ?? ''}
              placeholder="Paris" />
          </div>
        </FormCard>

        {/* ── Bloc : Profession & vie ── */}
        <FormCard icon="◻" title="Profession & vie">
          <div className="grid grid-cols-2 gap-4">
            <Field name="profession" label="Profession"
              defaultValue={editPerson?.profession ?? ''}
              placeholder="Architecte…" />
            <SelectField name="marital_status" label="Situation"
              defaultValue={editPerson?.marital_status ?? ''}>
              <option value="">—</option>
              <option>Marié(e)</option>
              <option>Célibataire</option>
              <option>Divorcé(e)</option>
              <option>Veuf / Veuve</option>
              <option>Pacsé(e)</option>
            </SelectField>
          </div>

          <div>
            <label className="block font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#7A7268] mb-1.5">
              Biographie
            </label>
            <textarea
              name="bio"
              defaultValue={editPerson?.bio ?? ''}
              rows={5}
              placeholder="Quelques lignes sur la vie et les anecdotes…"
              className="w-full bg-[#1E1C18] border border-[#2E2B25] text-[#E8E0D0] px-3.5 py-2.5 text-[0.82rem] rounded-[3px] outline-none focus:border-[#8B6420] focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] resize-y placeholder:text-[#4A4640] leading-relaxed"
            />
          </div>
        </FormCard>

        {/* ── Bloc : Relations (uniquement en mode ajout) ── */}
        {!isEdit && (
          <FormCard icon="⟋" title="Relations familiales">
            <p className="font-mono text-[0.68rem] text-[#7A7268] mb-3 italic">
              Tu pourras ajouter d'autres relations depuis la page Relations après la création.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#7A7268] mb-1.5">
                  Parent direct
                </label>
                <select
                  name="parent_id"
                  className="w-full bg-[#1E1C18] border border-[#2E2B25] text-[#E8E0D0] px-3.5 py-2.5 text-[0.82rem] rounded-[3px] outline-none focus:border-[#8B6420] cursor-pointer"
                >
                  <option value="">— Aucun —</option>
                  {allPersons.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} (Gen. {ROMANS[p.generation]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#7A7268] mb-1.5">
                  Conjoint(e)
                </label>
                <select
                  name="spouse_id"
                  className="w-full bg-[#1E1C18] border border-[#2E2B25] text-[#E8E0D0] px-3.5 py-2.5 text-[0.82rem] rounded-[3px] outline-none focus:border-[#8B6420] cursor-pointer"
                >
                  <option value="">— Aucun —</option>
                  {allPersons.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} (Gen. {ROMANS[p.generation]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FormCard>
        )}

        {/* ── Erreur + boutons ── */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-[rgba(200,90,61,0.1)] border border-[#C85A3D] rounded-[3px] font-mono text-[0.78rem] text-[#C85A3D]">
            ⚠ {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#C8922A] text-[#0E0D0B] px-5 py-2.5 font-playfair text-[0.85rem] rounded-[3px] hover:bg-[#D9A040] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending
              ? <><span className="animate-spin">⟳</span> Enregistrement…</>
              : <>{isEdit ? '✓ Mettre à jour' : '✓ Créer le membre'}</>
            }
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="bg-[#1E1C18] border border-[#2E2B25] text-[#7A7268] px-4 py-2.5 font-mono text-[0.72rem] rounded-[3px] hover:border-[#3A3630] hover:text-[#E8E0D0] transition-all"
          >
            Réinitialiser
          </button>

          <Link
            href="/admin/membres"
            className="ml-auto font-mono text-[0.72rem] text-[#7A7268] hover:text-[#E8E0D0] transition-colors"
          >
            ← Annuler
          </Link>
        </div>
      </form>

      {/* ── Colonne droite : aperçu ───────────────────── */}
      <div className="space-y-4">

        {/* Aperçu carte */}
        <div className="bg-[#161410] border border-[#2E2B25] rounded-[3px] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#2E2B25] flex items-center gap-2 font-playfair text-[0.88rem] text-[#E8E0D0]">
            <span className="text-[#C8922A] text-[0.8rem]">⊞</span> Aperçu
          </div>
          <div className="p-4">
            {/* Position dans l'arbre */}
            <div className="bg-[#1E1C18] border border-[#2E2B25] rounded-[3px] p-4 mb-4 text-center">
              <p className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-[#4A4640] mb-3">Position dans l'arbre</p>

              <div className="text-[0.72rem] text-[#7A7268] bg-[#252220] border border-[#3A3630] rounded-[3px] py-1.5 mb-2">
                {genNum > 1 ? `Génération ${ROMANS[genNum - 1]}` : '—'}
              </div>
              <div className="w-px h-4 bg-[#3A3630] mx-auto" />
              <div className="text-[0.72rem] text-[#C8922A] bg-[rgba(200,146,42,0.08)] border border-[rgba(200,146,42,0.2)] rounded-[3px] py-1.5 my-1 font-medium">
                {previewName}{genNum > 0 ? ` · Gen. ${ROMANS[genNum]}` : ''}
              </div>
              <div className="w-px h-4 bg-[#3A3630] mx-auto" />
              <div className="text-[0.72rem] text-[#7A7268] bg-[#252220] border border-[#3A3630] rounded-[3px] py-1.5 mt-2">
                {genNum > 0 && genNum < 5 ? `Génération ${ROMANS[genNum + 1]}` : '—'}
              </div>
            </div>

            {/* Carte parchement */}
            <div className="bg-[#F5F0E8] border border-[#C8B89A] rounded-[4px] p-4 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-playfair text-[#F5F0E8] text-lg mx-auto mb-2"
                style={{ background: '#5C3D2E' }}
              >
                {initials}
              </div>
              <p className="font-playfair text-[0.82rem] text-[#1C1A16] font-semibold leading-tight">
                {previewName}
              </p>
              <p className="text-[0.65rem] text-[#4A4540] mt-1 tracking-wide">
                {birth || '—'} — {editPerson?.death_year ?? 'présent'}
              </p>
              {genNum > 0 && (
                <p className="text-[0.6rem] text-[#8B4513] mt-1.5 uppercase tracking-widest italic">
                  Génération {ROMANS[genNum]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Upload photo */}
        <div className="bg-[#161410] border border-[#2E2B25] rounded-[3px] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#2E2B25] flex items-center gap-2 font-playfair text-[0.88rem] text-[#E8E0D0]">
            <span className="text-[#C8922A] text-[0.8rem]">◻</span> Photo
          </div>
          <div className="p-4">
            {editPerson?.photo_url && (
              <div className="text-center mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editPerson.photo_url}
                  alt={previewName}
                  className="w-20 h-20 rounded-full mx-auto mb-2 object-cover border-2 border-[#2E2B25]"
                />
                <p className="font-mono text-[0.65rem] text-[#4A8B5A]">✓ Photo existante</p>
              </div>
            )}
            <label className="block border border-dashed border-[#3A3630] rounded-[3px] py-6 px-5 text-center cursor-pointer hover:border-[#8B6420] hover:bg-[rgba(200,146,42,0.04)] transition-all bg-[#1E1C18]">
              <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="hidden" />
              <p className="text-xl mb-1.5">↑</p>
              <p className="text-[0.75rem] text-[#7A7268] mb-1">
                {editPerson?.photo_url ? 'Cliquer pour remplacer' : 'Cliquer pour choisir'}
              </p>
              <p className="font-mono text-[0.62rem] text-[#4A4640]">JPG, PNG, WebP · max 5 Mo</p>
              {!isEdit && (
                <p className="font-mono text-[0.6rem] text-[#4A4640] mt-1 italic">
                  Uploadée juste après la création
                </p>
              )}
            </label>
          </div>
        </div>

        {/* Infos mode édition */}
        {isEdit && (
          <div className="bg-[#1E1C18] border border-[#2E2B25] rounded-[3px] p-4">
            <p className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-[#4A4640] mb-2">Identifiant</p>
            <p className="font-mono text-[0.7rem] text-[#7A7268] break-all">{editPerson.id}</p>
            {editPerson.created_at && (
              <>
                <p className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-[#4A4640] mt-3 mb-1">Créé le</p>
                <p className="font-mono text-[0.7rem] text-[#7A7268]">
                  {new Date(editPerson.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sous-composants réutilisables ──────────────────────────────────────────

function FormCard({ icon, title, children }: {
  icon: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#161410] border border-[#2E2B25] rounded-[3px] overflow-hidden mb-5">
      <div className="px-5 py-3.5 border-b border-[#2E2B25] flex items-center gap-2 font-playfair text-[0.88rem] text-[#E8E0D0]">
        <span className="text-[#C8922A] text-[0.8rem]">{icon}</span>
        {title}
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  )
}

function Field({ name, label, defaultValue, placeholder, type = 'text', onChange }: {
  name: string
  label: string
  defaultValue?: string
  placeholder?: string
  type?: string
  onChange?: (v: string) => void
}) {
  return (
    <div>
      <label className="block font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#7A7268] mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        className="w-full bg-[#1E1C18] border border-[#2E2B25] text-[#E8E0D0] px-3.5 py-2.5 text-[0.82rem] rounded-[3px] outline-none focus:border-[#8B6420] focus:shadow-[0_0_0_3px_rgba(200,146,42,0.12)] transition-all placeholder:text-[#4A4640]"
      />
    </div>
  )
}

function SelectField({ name, label, defaultValue, children, onChange }: {
  name: string
  label: string
  defaultValue?: string
  children: React.ReactNode
  onChange?: (v: string) => void
}) {
  return (
    <div>
      <label className="block font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#7A7268] mb-1.5">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue}
        onChange={e => onChange?.(e.target.value)}
        className="w-full bg-[#1E1C18] border border-[#2E2B25] text-[#E8E0D0] px-3.5 py-2.5 text-[0.82rem] rounded-[3px] outline-none focus:border-[#8B6420] cursor-pointer"
      >
        {children}
      </select>
    </div>
  )
}

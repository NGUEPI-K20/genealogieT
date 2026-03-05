'use client'

import { useState, useTransition } from 'react'
import { deletePerson } from '@/lib/actions/persons'

interface Props {
  id: string
  name: string
}

export default function DeleteButton({ id, name }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePerson(id)
      if (!result.success) {
        setError(result.error)
      } else {
        setOpen(false)
      }
    })
  }

  return (
    <>
      {/* Bouton icône dans le tableau */}
      <button
        onClick={() => setOpen(true)}
        className="w-7 h-7 bg-[#252220] border border-[#2E2B25] text-[#7A7268] rounded-[3px] flex items-center justify-center text-[0.75rem] hover:border-[#C85A3D] hover:text-[#C85A3D] transition-all"
        title="Supprimer"
      >
        ✕
      </button>

      {/* Modale de confirmation */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-[900] flex items-center justify-center"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-[#161410] border border-[#3A3630] rounded-[3px] p-8 w-[360px] text-center shadow-2xl">
            <div className="text-3xl mb-4">⚠</div>
            <h3 className="font-playfair text-[1.1rem] text-[#E8E0D0] mb-2">
              Supprimer ce membre ?
            </h3>
            <p className="font-mono text-[0.78rem] text-[#7A7268] leading-relaxed mb-6">
              Vous allez supprimer{' '}
              <span className="text-[#E8E0D0] font-playfair italic">«{name}»</span>.
              <br />
              Ses relations seront également supprimées.
              <br className="mb-1" />
              <span className="text-[#C85A3D]">Cette action est irréversible.</span>
            </p>

            {error && (
              <p className="font-mono text-[0.72rem] text-[#C85A3D] mb-4 bg-[rgba(200,90,61,0.1)] border border-[#C85A3D] rounded-[3px] px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="bg-[#C85A3D] text-white border-none px-5 py-2.5 font-mono text-[0.78rem] tracking-wide rounded-[3px] cursor-pointer hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isPending ? '⟳ Suppression…' : 'Supprimer définitivement'}
              </button>
              <button
                onClick={() => { setOpen(false); setError(null) }}
                disabled={isPending}
                className="bg-[#1E1C18] border border-[#2E2B25] text-[#7A7268] px-5 py-2.5 font-mono text-[0.78rem] rounded-[3px] hover:border-[#3A3630] hover:text-[#E8E0D0] transition-all disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

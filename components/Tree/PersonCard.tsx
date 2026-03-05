'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Person } from '@/lib/types'

interface PersonCardProps extends NodeProps {
  data: Person & { onSelect: (p: Person) => void; isActive: boolean }
}

function PersonCard({ data, selected }: PersonCardProps) {
  const { first_name, last_name, birth_name, birth_year, death_year, current_place, color, initials, onSelect, isActive } = data
  const isDead = death_year !== null && death_year !== undefined
  const displayName = birth_name ? `${last_name} · ${birth_name}` : last_name

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: 'none' }} />

      <div
        onClick={() => onSelect(data)}
        className={`
          w-36 bg-[#FAF7F2] border rounded-[4px] p-4 cursor-pointer
          transition-all duration-200 ease-out
          ${isActive
            ? 'border-[#8B4513] shadow-[0_8px_32px_rgba(28,26,22,0.12),0_0_0_3px_rgba(139,69,19,0.15)]'
            : 'border-[#C8B89A] shadow-[0_2px_8px_rgba(28,26,22,0.12)] hover:border-[#C8A882] hover:shadow-[0_6px_24px_rgba(28,26,22,0.15)] hover:-translate-y-0.5'
          }
        `}
      >
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-full mx-auto mb-2.5 flex items-center justify-center font-playfair text-xl font-semibold text-[#FAF7F2] relative overflow-hidden"
          style={{ background: color, opacity: isDead ? 0.7 : 1, filter: isDead ? 'grayscale(30%)' : 'none' }}
        >
          {initials}
          <div className="absolute inset-0 rounded-full border border-white/20" />
        </div>

        {/* Name */}
        <p className="font-playfair text-[0.78rem] font-semibold text-center text-ink leading-tight mb-1">
          {first_name}<br />
          <span className="font-normal">{displayName}</span>
        </p>

        {/* Dates */}
        <p className="text-[0.65rem] text-center text-ink-light tracking-wide">
          {birth_year}{isDead ? ` — ${death_year}` : ' — présent'}
        </p>

        {/* Place */}
        {current_place && (
          <p className="text-[0.6rem] text-center text-[#8B4513] tracking-widest uppercase mt-1.5 italic">
            {current_place}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
    </>
  )
}

export default memo(PersonCard)

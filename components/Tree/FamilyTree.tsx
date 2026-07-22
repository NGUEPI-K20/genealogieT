'use client'

import { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { Person, Relation } from '@/lib/types'
import { computeLayout } from '@/lib/layout'
import PersonCard from './PersonCard'
import PersonPanel from '@/components/PersonPanel/PersonPanel'

const nodeTypes = { personCard: PersonCard }

interface FamilyTreeProps {
  people: Person[]
  relations: Relation[]
}

export default function FamilyTree({ people, relations }: FamilyTreeProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  const handleSelect = useCallback((person: Person) => {
    setSelectedPerson(prev => prev?.id === person.id ? null : person)
  }, [])

  const positions = useMemo(() => computeLayout(people, relations), [people, relations])

  const initialNodes: Node[] = useMemo(() =>
    people.map(person => ({
      id: person.id,
      type: 'personCard',
      position: positions[person.id] ?? { x: 0, y: 0 },
      data: { ...person, onSelect: handleSelect, isActive: false },
      draggable: false,
    })),
    [people, positions, handleSelect]
  )

  const initialEdges: Edge[] = useMemo(() =>
    relations.map(rel => ({
      id: rel.id,
      source: rel.person_a_id,
      target: rel.person_b_id,
      type: 'smoothstep',
      style: rel.type === 'union'
        ? { stroke: '#A81C1C', strokeWidth: 1.5, strokeDasharray: '4 3', opacity: 0.55 }
        : { stroke: '#D4A017', strokeWidth: 1.75, opacity: 0.75 },
      animated: false,
    })),
    [relations]
  )

  const [nodes, , onNodesChange] = useNodesState(
    initialNodes.map(n => ({
      ...n,
      data: { ...n.data, isActive: selectedPerson?.id === n.id },
    }))
  )
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  // Sync active state
  const nodesWithActive = useMemo(() =>
    nodes.map(n => ({
      ...n,
      data: { ...n.data, isActive: selectedPerson?.id === n.id },
    })),
    [nodes, selectedPerson]
  )

  const relatedPeople = useMemo(() => {
    if (!selectedPerson) return []
    return relations
      .filter(r => r.person_a_id === selectedPerson.id || r.person_b_id === selectedPerson.id)
      .map(r => {
        const otherId = r.person_a_id === selectedPerson.id ? r.person_b_id : r.person_a_id
        return people.find(p => p.id === otherId)
      })
      .filter(Boolean)
      .sort((a, b) => (a!.birth_year ?? 0) - (b!.birth_year ?? 0)) as Person[]
  }, [selectedPerson, relations, people])

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodesWithActive}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1, minZoom: 0.2, maxZoom: 1.5 }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
        panOnDrag
        zoomOnScroll
        panOnScroll={false}
        onPaneClick={() => setSelectedPerson(null)}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1}
          color="#C8B89A"
          style={{ opacity: 0.3 }}
        />
        <Controls
          showInteractive={false}
          className="!bottom-8 !left-1/2 !-translate-x-1/2 !top-auto !right-auto"
          style={{
            background: '#1C1A16',
            border: 'none',
            borderRadius: '40px',
            padding: '4px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}
        />
      </ReactFlow>

      {/* Person detail panel */}
      <PersonPanel
        person={selectedPerson}
        relatedPeople={relatedPeople}
        allRelations={relations}
        onClose={() => setSelectedPerson(null)}
        onSelectPerson={handleSelect}
      />
    </div>
  )
}

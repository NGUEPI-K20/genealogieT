export interface Person {
  id: string
  first_name: string
  last_name: string
  birth_name?: string | null
  birth_year: number
  death_year?: number | null
  birth_place?: string | null
  current_place?: string | null
  generation: 1 | 2 | 3 | 4 | 5
  gender?: 'M' | 'F' | null
  profession?: string | null
  marital_status?: string | null
  bio?: string | null
  photo_url?: string | null
  color: string
  initials: string
  created_at?: string
  updated_at?: string
}

export interface Relation {
  id: string
  person_a_id: string
  person_b_id: string
  type: 'parent' | 'union'
  since_year?: number | null
  created_at?: string
}

export interface PersonWithRelations extends Person {
  relatives?: Person[]
}

// For React Flow nodes
export interface TreeNode {
  id: string
  position: { x: number; y: number }
  data: Person
  type: 'personCard'
}

export interface TreeEdge {
  id: string
  source: string
  target: string
  type: 'filiation' | 'union'
}

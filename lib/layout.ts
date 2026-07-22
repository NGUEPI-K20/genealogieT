import { Person, Relation } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Positionnement automatique de l'arbre pour React Flow.
//
// Avant, les positions de chaque nœud étaient codées en dur (NODE_POSITIONS
// dans lib/data.ts), ce qui obligeait à éditer du code à chaque nouveau membre.
// Comme les membres sont désormais ajoutés depuis /admin/ajouter, on calcule
// la position de chaque personne à partir de sa génération et de ses relations :
//   - l'axe Y dépend uniquement de la génération (1 → 5)
//   - l'axe X est calculé génération par génération : les enfants sont replacés
//     au-dessus du barycentre (moyenne des positions X) de leurs parents, et
//     les conjoints sont gardés côte à côte.
// ─────────────────────────────────────────────────────────────────────────────

interface Position {
  x: number
  y: number
}

const H_GAP = 220 // écart horizontal entre deux personnes voisines
const V_GAP = 240 // écart vertical entre deux générations

export function computeLayout(
  people: Person[],
  relations: Relation[]
): Record<string, Position> {
  const byGeneration = new Map<number, Person[]>()
  for (const person of people) {
    const list = byGeneration.get(person.generation) ?? []
    list.push(person)
    byGeneration.set(person.generation, list)
  }

  const parentsOf = new Map<string, string[]>()
  const spouseOf = new Map<string, string>()

  for (const rel of relations) {
    if (rel.type === 'parent') {
      const list = parentsOf.get(rel.person_b_id) ?? []
      list.push(rel.person_a_id)
      parentsOf.set(rel.person_b_id, list)
    } else if (rel.type === 'union') {
      spouseOf.set(rel.person_a_id, rel.person_b_id)
      spouseOf.set(rel.person_b_id, rel.person_a_id)
    }
  }

  const positions: Record<string, Position> = {}
  const generations = Array.from(byGeneration.keys()).sort((a, b) => a - b)

  for (const generation of generations) {
    const peopleInGen = byGeneration.get(generation)!
    const isFirstGen = generation === generations[0]

    // Trie par barycentre des positions des parents (déjà calculées, car on
    // traite les générations dans l'ordre croissant). Sans parent positionné,
    // on garde l'ordre d'origine (poussé en fin de liste).
    const withScore = peopleInGen.map(person => {
      if (isFirstGen) return { person, score: 0 }
      const parentIds = parentsOf.get(person.id) ?? []
      const parentXs = parentIds
        .map(id => positions[id]?.x)
        .filter((x): x is number => x !== undefined)
      const score = parentXs.length > 0
        ? parentXs.reduce((a, b) => a + b, 0) / parentXs.length
        : Number.POSITIVE_INFINITY
      return { person, score }
    })
    withScore.sort((a, b) => a.score - b.score)

    // Place les personnes en gardant les conjoints adjacents.
    const placed = new Set<string>()
    const ordered: Person[] = []
    for (const { person } of withScore) {
      if (placed.has(person.id)) continue
      ordered.push(person)
      placed.add(person.id)

      const spouseId = spouseOf.get(person.id)
      if (spouseId && !placed.has(spouseId)) {
        const spouse = peopleInGen.find(p => p.id === spouseId)
        if (spouse) {
          ordered.push(spouse)
          placed.add(spouseId)
        }
      }
    }

    // Centre la génération : chaque rangée est répartie symétriquement autour
    // de x = 0, quelle que soit sa largeur. Grands-parents (peu nombreux) et
    // petits-enfants (nombreux) partagent ainsi le même axe central, ce qui
    // donne un arbre visuellement centré, génération après génération.
    const rowWidth = (ordered.length - 1) * H_GAP
    const offset = -rowWidth / 2

    ordered.forEach((person, index) => {
      positions[person.id] = {
        x: offset + index * H_GAP,
        y: (generation - 1) * V_GAP,
      }
    })
  }

  return positions
}

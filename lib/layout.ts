import { Person, Relation } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Positionnement automatique de l'arbre pour React Flow.
//
// Objectif : reproduire la lisibilité d'un arbre généalogique classique —
// un couple parent est toujours centré exactement au-dessus du milieu de SES
// enfants, génération après génération (comme sur les posters "Arbre
// généalogique" traditionnels), plutôt qu'un simple alignement par ligne.
//
// Principe (algorithme de type Reingold–Tilford simplifié) :
//   1. On regroupe chaque génération en "unités" — une personne seule, ou un
//      couple (deux conjoints) — reliées à leurs enfants via les relations
//      de filiation.
//   2. Largeur d'une unité = somme des largeurs de ses unités-enfants (1 si
//      elle n'a pas d'enfant). Calcul du bas vers le haut.
//   3. Position X = on redescend du haut vers le bas : chaque unité reçoit
//      une plage horizontale proportionnelle à sa largeur, et se centre sur
//      le milieu de la plage occupée par SES enfants.
// ─────────────────────────────────────────────────────────────────────────────

interface Position {
  x: number
  y: number
}

const UNIT_SPAN = 220  // largeur en pixels d'une unité de largeur 1
const COUPLE_GAP = 150 // écart entre les deux conjoints d'un même couple
const V_GAP = 240       // écart vertical entre deux générations

interface Unit {
  members: Person[]
  children: Unit[]
  width: number
  generation: number
}

export function computeLayout(
  people: Person[],
  relations: Relation[]
): Record<string, Position> {
  if (people.length === 0) return {}

  const byGeneration = new Map<number, Person[]>()
  for (const person of people) {
    const list = byGeneration.get(person.generation) ?? []
    list.push(person)
    byGeneration.set(person.generation, list)
  }

  const parentsOf = new Map<string, string[]>()
  // Un même conjoint peut être marié à plusieurs personnes (polygamie) : on
  // accumule TOUS les partenaires au lieu d'écraser la relation précédente.
  const spousesOf = new Map<string, Set<string>>()
  for (const rel of relations) {
    if (rel.type === 'parent') {
      const list = parentsOf.get(rel.person_b_id) ?? []
      list.push(rel.person_a_id)
      parentsOf.set(rel.person_b_id, list)
    } else if (rel.type === 'union') {
      const a = spousesOf.get(rel.person_a_id) ?? new Set<string>()
      a.add(rel.person_b_id)
      spousesOf.set(rel.person_a_id, a)
      const b = spousesOf.get(rel.person_b_id) ?? new Set<string>()
      b.add(rel.person_a_id)
      spousesOf.set(rel.person_b_id, b)
    }
  }

  // Tri par année de naissance décroissante (benjamin → aîné). Le premier
  // élément du tableau reçoit le décalage X le plus petit (voir assignX
  // en §4), donc le/la benjamin(e) se retrouve à GAUCHE et l'aîné(e),
  // placé(e) en dernier, se retrouve à DROITE — lecture traditionnelle
  // "droite → gauche" de l'ordre de naissance.
  // Ce même ordre trié doit être réutilisé PARTOUT (étapes 1 et 2) : sinon
  // l'étape qui relie les unités à leurs parents retomberait sur l'ordre
  // d'origine (croissant) et inverserait le sens d'affichage.
  const generations = Array.from(byGeneration.keys()).sort((a, b) => a - b)
  const sortedByGeneration = new Map<number, Person[]>()
  for (const generation of generations) {
    sortedByGeneration.set(
      generation,
      [...byGeneration.get(generation)!].sort((a, b) => (b.birth_year ?? 0) - (a.birth_year ?? 0))
    )
  }

  // ─── 1. Construit les unités (personne seule ou couple) par génération ────
  const personToUnit = new Map<string, Unit>()

  for (const generation of generations) {
    const peopleInGen = sortedByGeneration.get(generation)!
    const placed = new Set<string>()

    for (const person of peopleInGen) {
      if (placed.has(person.id)) continue

      // Regroupe la personne avec TOUS ses conjoint(e)s connu(e)s, par
      // fermeture transitive du graphe des unions : si on rencontre d'abord
      // la 2e épouse d'un mari polygame, il faut quand même récupérer le
      // mari ET sa 1ère épouse (un simple aller-retour sur 1 niveau les
      // manquerait et créerait une unité fantôme dupliquée).
      const ids = new Set<string>([person.id])
      const queue = [person.id]
      while (queue.length > 0) {
        const current = queue.shift()!
        for (const sid of Array.from(spousesOf.get(current) ?? [])) {
          if (!ids.has(sid)) {
            ids.add(sid)
            queue.push(sid)
          }
        }
      }
      let members = Array.from(ids)
        .map(id => peopleInGen.find(p => p.id === id))
        .filter((p): p is Person => !!p)
        // Tri déterministe par année de naissance : Postgres ne garantit pas
        // l'ordre des lignes sans ORDER BY, donc on ne peut pas se fier à
        // l'ordre d'arrivée des relations pour placer les conjoint(e)s.
        .sort((a, b) => (a.birth_year ?? 0) - (b.birth_year ?? 0))

      // La personne de sang (celle qui a des parents enregistrés dans une
      // génération précédente) est placée au centre de l'unité, les
      // conjoint(e)s de part et d'autre.
      const anchorIndex = members.findIndex(m => (parentsOf.get(m.id) ?? []).length > 0)
      const targetIndex = Math.floor((members.length - 1) / 2)
      if (anchorIndex !== -1 && members.length > 1 && anchorIndex !== targetIndex) {
        const [anchor] = members.splice(anchorIndex, 1)
        members.splice(targetIndex, 0, anchor)
      }

      members.forEach(m => placed.add(m.id))

      const unit: Unit = { members, children: [], width: 1, generation }
      members.forEach(m => personToUnit.set(m.id, unit))
    }
  }

  // ─── 2. Relie chaque unité à son unité-parente ─────────────────────────────
  const rootUnits: Unit[] = []
  const linkedAsChild = new Set<Unit>()

  for (const generation of generations) {
    const peopleInGen = sortedByGeneration.get(generation)!
    const seen = new Set<Unit>()

    for (const person of peopleInGen) {
      const unit = personToUnit.get(person.id)!
      if (seen.has(unit)) continue
      seen.add(unit)

      const parentIds = unit.members.flatMap(m => parentsOf.get(m.id) ?? [])
      const parentUnit = parentIds
        .map(id => personToUnit.get(id))
        .find((u): u is Unit => !!u && u !== unit)

      if (parentUnit && !parentUnit.children.includes(unit)) {
        parentUnit.children.push(unit)
        linkedAsChild.add(unit)
      }
    }
  }

  // Unités racines : toute unité qui n'a été rattachée à aucun parent
  // (normalement la génération 1, mais on reste tolérant aux données isolées).
  for (const generation of generations) {
    const peopleInGen = sortedByGeneration.get(generation)!
    const seen = new Set<Unit>()
    for (const person of peopleInGen) {
      const unit = personToUnit.get(person.id)!
      if (seen.has(unit)) continue
      seen.add(unit)
      if (!linkedAsChild.has(unit)) rootUnits.push(unit)
    }
  }

  // ─── 3. Largeur de chaque unité, du bas vers le haut ──────────────────────
  function computeWidth(unit: Unit): number {
    if (unit.children.length === 0) {
      unit.width = 1
    } else {
      unit.width = unit.children.reduce((sum, c) => sum + computeWidth(c), 0)
    }
    return unit.width
  }
  rootUnits.forEach(computeWidth)

  // ─── 4. Position X, du haut vers le bas ───────────────────────────────────
  const positions: Record<string, Position> = {}

  function assignX(unit: Unit, startOffset: number) {
    const center = startOffset + unit.width / 2
    const x = center * UNIT_SPAN
    const y = (unit.generation - 1) * V_GAP

    // Répartit symétriquement les membres de l'unité (1 seul, un couple,
    // ou une personne + plusieurs conjoint(e)s en cas de polygamie).
    const n = unit.members.length
    unit.members.forEach((m, i) => {
      const memberOffsetX = (i - (n - 1) / 2) * COUPLE_GAP
      positions[m.id] = { x: x + memberOffsetX, y }
    })

    let childOffset = startOffset
    for (const child of unit.children) {
      assignX(child, childOffset)
      childOffset += child.width
    }
  }

  let rootOffset = 0
  for (const root of rootUnits) {
    assignX(root, rootOffset)
    rootOffset += root.width
  }

  return positions
}

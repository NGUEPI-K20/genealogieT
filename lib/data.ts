import { Person, Relation } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Données de secours (fallback), utilisées uniquement si Supabase n'est pas
// joignable ou pas configuré. La vraie base de données vit dans Supabase
// (tables `persons` et `relations` — voir supabase/schema.sql).
//
// Volontairement vide : ajoute les membres de la famille Nguepi / Douanio
// depuis l'interface d'administration (/admin/ajouter), en commençant par
// les grands-parents.
// ─────────────────────────────────────────────────────────────────────────────

export const PEOPLE: Person[] = []

export const RELATIONS: Relation[] = []

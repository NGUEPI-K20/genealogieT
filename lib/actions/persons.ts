'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Person } from '@/lib/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Génère un id unique slug-style depuis prénom + nom + timestamp */
function generateId(firstName: string, lastName: string): string {
  const slug = `${firstName}-${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // retire les accents
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug}-${Date.now().toString(36)}`
}

/** Génère les initiales depuis prénom + nom */
function generateInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

/** Palette de couleurs selon la génération */
const GEN_COLORS: Record<number, string[]> = {
  1: ['#5C3D2E', '#7A5C4E'],
  2: ['#3D5A47', '#6B4E6B', '#7A5C2E', '#4A4540', '#2E4A5C', '#5C3D5C'],
  3: ['#3D5A47', '#7A5C2E', '#6B4E6B', '#4A4540', '#2E4A5C', '#5C3D2E'],
  4: ['#2E4A5C', '#6B4E6B', '#7A5C2E', '#3D5A47', '#5C3D2E'],
  5: ['#7A5C2E', '#2E4A5C', '#5C3D2E', '#3D5A47', '#6B4E6B'],
}

function pickColor(generation: number, existingColors: string[]): string {
  const palette = GEN_COLORS[generation] ?? GEN_COLORS[3]
  // Préfère une couleur non encore utilisée dans cette génération
  const unused = palette.filter(c => !existingColors.includes(c))
  return unused[0] ?? palette[Math.floor(Math.random() * palette.length)]
}

// ─── Types internes ──────────────────────────────────────────────────────────

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string }

// ─── CREATE ─────────────────────────────────────────────────────────────────

export async function createPerson(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  // Champs obligatoires
  const first_name = (formData.get('first_name') as string)?.trim()
  const last_name  = (formData.get('last_name')  as string)?.trim()
  const birth_year = parseInt(formData.get('birth_year') as string)
  const generation = parseInt(formData.get('generation') as string)

  if (!first_name || !last_name) {
    return { success: false, error: 'Prénom et nom sont obligatoires.' }
  }
  if (isNaN(birth_year) || birth_year < 1800 || birth_year > new Date().getFullYear()) {
    return { success: false, error: 'Année de naissance invalide.' }
  }
  if (!generation || generation < 1 || generation > 5) {
    return { success: false, error: 'Génération invalide (1 à 5).' }
  }

  // Champs optionnels
  const death_year_raw = formData.get('death_year') as string
  const death_year = death_year_raw ? parseInt(death_year_raw) : null

  if (death_year && death_year <= birth_year) {
    return { success: false, error: 'L\'année de décès doit être après la naissance.' }
  }

  // Récupère les couleurs déjà utilisées dans cette génération pour éviter les doublons
  const { data: sameGen } = await supabase
    .from('persons')
    .select('color')
    .eq('generation', generation)

  const existingColors = (sameGen ?? []).map(p => p.color)

  const person: Omit<Person, 'created_at' | 'updated_at'> = {
    id:             generateId(first_name, last_name),
    first_name,
    last_name,
    birth_name:     (formData.get('birth_name') as string)?.trim() || null,
    birth_year,
    death_year,
    birth_place:    (formData.get('birth_place') as string)?.trim() || null,
    current_place:  (formData.get('current_place') as string)?.trim() || null,
    generation:     generation as 1 | 2 | 3 | 4 | 5,
    gender:         (formData.get('gender') as 'M' | 'F') || null,
    profession:     (formData.get('profession') as string)?.trim() || null,
    marital_status: (formData.get('marital_status') as string)?.trim() || null,
    bio:            (formData.get('bio') as string)?.trim() || null,
    photo_url:      null,
    color:          pickColor(generation, existingColors),
    initials:       generateInitials(first_name, last_name),
  }

  const { error } = await supabase.from('persons').insert(person)

  if (error) {
    console.error('createPerson error:', error)
    return { success: false, error: 'Erreur lors de l\'ajout. Réessayez.' }
  }

  // Créer les relations si précisées
  const parent_id = formData.get('parent_id') as string
  const spouse_id = formData.get('spouse_id') as string

  const relationsToInsert = []

  if (parent_id) {
    relationsToInsert.push({
      id: `rel-${person.id}-parent-${Date.now()}`,
      person_a_id: parent_id,
      person_b_id: person.id,
      type: 'parent' as const,
    })
  }
  if (spouse_id) {
    relationsToInsert.push({
      id: `rel-${person.id}-union-${Date.now()}`,
      person_a_id: person.id,
      person_b_id: spouse_id,
      type: 'union' as const,
    })
  }

  if (relationsToInsert.length > 0) {
    await supabase.from('relations').insert(relationsToInsert)
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/admin/membres')

  return { success: true, id: person.id }
}

// ─── UPDATE ─────────────────────────────────────────────────────────────────

export async function updatePerson(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  if (!id) return { success: false, error: 'ID manquant.' }

  const first_name = (formData.get('first_name') as string)?.trim()
  const last_name  = (formData.get('last_name')  as string)?.trim()
  const birth_year = parseInt(formData.get('birth_year') as string)
  const generation = parseInt(formData.get('generation') as string)

  if (!first_name || !last_name) {
    return { success: false, error: 'Prénom et nom sont obligatoires.' }
  }
  if (isNaN(birth_year)) {
    return { success: false, error: 'Année de naissance invalide.' }
  }

  const death_year_raw = formData.get('death_year') as string
  const death_year = death_year_raw ? parseInt(death_year_raw) : null

  const updates: Partial<Person> = {
    first_name,
    last_name,
    birth_name:     (formData.get('birth_name') as string)?.trim() || null,
    birth_year,
    death_year,
    birth_place:    (formData.get('birth_place') as string)?.trim() || null,
    current_place:  (formData.get('current_place') as string)?.trim() || null,
    generation:     generation as 1 | 2 | 3 | 4 | 5,
    gender:         (formData.get('gender') as 'M' | 'F') || null,
    profession:     (formData.get('profession') as string)?.trim() || null,
    marital_status: (formData.get('marital_status') as string)?.trim() || null,
    bio:            (formData.get('bio') as string)?.trim() || null,
    initials:       generateInitials(first_name, last_name),
  }

  const { error } = await supabase
    .from('persons')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('updatePerson error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour.' }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/admin/membres')
  revalidatePath(`/admin/ajouter?id=${id}`)

  return { success: true }
}

// ─── DELETE ─────────────────────────────────────────────────────────────────

export async function deletePerson(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Les relations sont supprimées automatiquement via ON DELETE CASCADE
  const { error } = await supabase
    .from('persons')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('deletePerson error:', error)
    return { success: false, error: 'Erreur lors de la suppression.' }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/admin/membres')

  return { success: true }
}

// ─── GET ONE (pour pré-remplir le formulaire d'édition) ──────────────────────

export async function getPersonById(id: string): Promise<Person | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Person
}

// ─── UPLOAD PHOTO ────────────────────────────────────────────────────────────

export async function uploadPhoto(
  personId: string,
  file: File
): Promise<ActionResult & { url?: string }> {
  const supabase = await createClient()

  const ext = file.name.split('.').pop()
  const path = `${personId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(path, file, { upsert: true })

  if (uploadError) {
    return { success: false, error: 'Erreur upload photo.' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('persons')
    .update({ photo_url: publicUrl })
    .eq('id', personId)

  if (updateError) {
    return { success: false, error: 'Photo uploadée mais non liée.' }
  }

  revalidatePath('/')
  revalidatePath('/admin/membres')

  return { success: true, url: publicUrl }
}

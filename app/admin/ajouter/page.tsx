import { createClient } from '@/lib/supabase/server'
import { Person } from '@/lib/types'
import { createPerson, updatePerson, getPersonById, uploadPhoto } from '@/lib/actions/persons'
import { redirect } from 'next/navigation'
import MemberFormClient from './MemberFormClient'

async function loadData(editId?: string) {
  const supabase = await createClient()

  const [{ data: allPersons }, editPerson] = await Promise.all([
    supabase
      .from('persons')
      .select('id, first_name, last_name, generation')
      .order('generation')
      .order('birth_year'),
    editId ? getPersonById(editId) : Promise.resolve(null),
  ])

  return {
    allPersons: (allPersons ?? []) as Pick<Person, 'id' | 'first_name' | 'last_name' | 'generation'>[],
    editPerson,
  }
}

interface PageProps {
  searchParams: { id?: string }
}

export default async function AjouterPage({ searchParams }: PageProps) {
  const editId = searchParams.id
  const { allPersons, editPerson } = await loadData(editId)
  const isEdit = !!editPerson

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = isEdit
      ? await updatePerson(formData)
      : await createPerson(formData)

    if (!result.success) {
      throw new Error(result.error)
    }

    const photo = formData.get('photo')
    if (photo instanceof File && photo.size > 0) {
      const personId = isEdit
        ? (formData.get('id') as string | null)
        : (result.id ?? null)

      if (!personId) {
        throw new Error('Impossible de déterminer le membre pour la photo.')
      }

      const uploadResult = await uploadPhoto(personId, photo)
      if (!uploadResult.success) {
        throw new Error(uploadResult.error)
      }
    }

    redirect('/admin/membres')
  }

  return (
    <MemberFormClient
      allPersons={allPersons}
      editPerson={editPerson}
      action={handleSubmit}
    />
  )
}

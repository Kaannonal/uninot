import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NoteEditForm from './NoteEditForm'

export default async function NoteEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: note } = await supabase
    .from('notes')
    .select(`
      id, title, description, note_type, term, page_count, status, file_url,
      courses ( code, name, departments ( name, faculties ( universities ( name ) ) ) )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!note) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const course     = note.courses as any
  const department = course?.departments
  const university = department?.faculties?.universities?.name

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Notu Düzenle</h1>
        <div className="text-sm text-muted-foreground space-y-0.5">
          {university && <p>🏛 {university}</p>}
          {department && <p>📂 {department.name}</p>}
          {course     && <p>📖 <span className="font-mono">{course.code}</span> — {course.name}</p>}
        </div>
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-3">
          ⚠ Kaydettiğinde not tekrar incelemeye alınacak ve admin onaylayana kadar yayından kalkacak.
        </p>
      </div>

      <NoteEditForm note={note} />
    </div>
  )
}

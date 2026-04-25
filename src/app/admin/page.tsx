import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNoteList from './AdminNoteList'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const { data: pendingNotes } = await supabase
    .from('notes')
    .select(`
      id, title, created_at, status,
      courses (
        code, name,
        departments (
          name,
          faculties ( universities ( name ) )
        )
      ),
      profiles ( full_name )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Paneli</h1>
        <span className="text-sm text-muted-foreground">
          {pendingNotes?.length ?? 0} bekleyen not
        </span>
      </div>
      <AdminNoteList initialNotes={pendingNotes ?? []} />
    </div>
  )
}

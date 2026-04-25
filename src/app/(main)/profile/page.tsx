import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: universities }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, university_id, department_id, role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('universities')
      .select('id, name')
      .order('name'),
  ])

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Profilim</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Üniversite ve bölüm bilgilerini güncelleyebilirsin.
      </p>
      <ProfileForm
        userId={user.id}
        email={user.email ?? ''}
        initialProfile={profile ?? { full_name: null, university_id: null, department_id: null }}
        universities={universities ?? []}
      />
    </div>
  )
}

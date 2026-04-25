import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UploadForm from './UploadForm'

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: universities } = await supabase
    .from('universities')
    .select('id, name, city')
    .order('name')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Not Yükle</h1>
      <p className="text-sm text-muted-foreground mb-8">
        PDF notunu yükle, onaylandıktan sonra diğer öğrencilerle paylaşıma açılacak.
      </p>
      <UploadForm universities={universities ?? []} userId={user.id} />
    </div>
  )
}

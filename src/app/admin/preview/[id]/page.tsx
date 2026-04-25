import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PdfViewerWrapper from '@/components/pdf/PdfViewerWrapper'

const noteTypeLabels: Record<string, string> = {
  vize: 'Vize', final: 'Final', ozet: 'Özet', formul: 'Formül', diger: 'Diğer',
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:      { label: 'İncelemede', className: 'bg-yellow-100 text-yellow-800' },
  approved:     { label: 'Yayında',    className: 'bg-green-100 text-green-800'   },
  rejected:     { label: 'Reddedildi', className: 'bg-red-100 text-red-800'       },
  under_review: { label: 'İncelemede', className: 'bg-blue-100 text-blue-800'     },
  removed:      { label: 'Kaldırıldı', className: 'bg-gray-100 text-gray-600'     },
}

export default async function AdminPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Admin kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Status filtresi yok — her statüdeki notu göster
  const { data: note } = await supabase
    .from('notes')
    .select(`
      *,
      courses (
        code, name,
        departments (
          name,
          faculties ( name, universities ( name, city ) )
        )
      ),
      profiles ( full_name )
    `)
    .eq('id', id)
    .single()

  if (!note) notFound()

  const course     = note.courses as { code: string; name: string; departments: { name: string; faculties: { name: string; universities: { name: string; city: string } } } }
  const department = course?.departments
  const university = department?.faculties?.universities
  const uploader   = (note.profiles as { full_name: string | null } | null)?.full_name ?? 'Anonim'
  const statusCfg  = statusConfig[note.status] ?? statusConfig.pending

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Admin banner */}
      <div className="flex items-center justify-between mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <span>🔒 Admin Önizlemesi</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.className}`}>
            {statusCfg.label}
          </span>
        </div>
        <Link href="/admin">
          <Button variant="outline" size="sm">← Admin Paneli</Button>
        </Link>
      </div>

      {/* Başlık & meta */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{note.title}</h1>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
          {university && <span>🏛 {university.name}</span>}
          {department && <span>· {department.name}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{noteTypeLabels[note.note_type] ?? note.note_type}</Badge>
          {note.term && <Badge variant="outline">{note.term}</Badge>}
          {course && (
            <Badge variant="outline" className="font-mono text-xs">
              {course.code} — {course.name}
            </Badge>
          )}
        </div>

        {note.description && (
          <p className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3 border">
            {note.description}
          </p>
        )}

        <div className="flex gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
          <span>👤 {uploader}</span>
          <span>🗓 {new Date(note.created_at).toLocaleDateString('tr-TR')}</span>
          {note.page_count && <span>📄 {note.page_count} sayfa</span>}
        </div>
      </div>

      {/* PDF görüntüleyici */}
      <div className="border rounded-xl p-4 bg-white">
        <PdfViewerWrapper url={note.file_url} />
      </div>
    </div>
  )
}

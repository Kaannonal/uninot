import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PdfViewerWrapper from '@/components/pdf/PdfViewerWrapper'
import ViewTracker from '@/components/pdf/ViewTracker'
import DownloadButton from '@/components/pdf/DownloadButton'
import ReviewSection from '@/components/notes/ReviewSection'

const noteTypeLabels: Record<string, string> = {
  vize: 'Vize', final: 'Final', ozet: 'Özet', formul: 'Formül', diger: 'Diğer',
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: note } = await supabase
    .from('notes')
    .select(`
      *,
      courses (
        code, name,
        departments (
          name,
          faculties (
            name,
            universities ( name, city )
          )
        )
      ),
      profiles ( full_name )
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (!note) notFound()

  const course      = note.courses as { code: string; name: string; departments: { name: string; faculties: { name: string; universities: { name: string; city: string } } } }
  const department  = course?.departments
  const faculty     = department?.faculties
  const university  = faculty?.universities
  const uploader    = (note.profiles as { full_name: string | null } | null)?.full_name ?? 'Anonim'

  // Kullanıcı bilgisi + yorumlar
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: reviews }, { data: myReview }] = await Promise.all([
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, profiles(full_name)')
      .eq('note_id', id)
      .order('created_at', { ascending: false }),
    user
      ? supabase.from('reviews').select('rating, comment').eq('note_id', id).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Başlık & meta */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">{note.title}</h1>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
          {university && <span>🏛 {university.name}</span>}
          {department && <span>· {department.name}</span>}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{noteTypeLabels[note.note_type] ?? note.note_type}</Badge>
          {note.term && <Badge variant="outline">{note.term}</Badge>}
          {course && (
            <Badge variant="outline" className="font-mono text-xs">
              {course.code} — {course.name}
            </Badge>
          )}
        </div>

        {/* İndir butonu — mobilde tam genişlik */}
        <div className="mb-4">
          <DownloadButton noteId={note.id} fileUrl={note.file_url} className="w-full sm:w-auto" />
        </div>

        {note.description && (
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3 border">
            {note.description}
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
          <span>👁 {note.view_count} görüntülenme</span>
          <span>⬇ {note.download_count} indirme</span>
          {reviews && reviews.length > 0 && (
            <span>⭐ {note.avg_rating.toFixed(1)} ({reviews.length} değerlendirme)</span>
          )}
          {note.page_count && <span>📄 {note.page_count} sayfa</span>}
          <span>👤 {uploader}</span>
          <span>🗓 {new Date(note.created_at).toLocaleDateString('tr-TR')}</span>
        </div>
      </div>

      {/* PDF görüntüleyici — mobilde -mx-4 ile tam genişlik */}
      <div className="border rounded-xl p-2 sm:p-4 bg-white -mx-4 sm:mx-0 overflow-hidden">
        <PdfViewerWrapper url={note.file_url} />
      </div>

      {/* Alt indirme */}
      <div className="mt-6 flex justify-center">
        <DownloadButton noteId={note.id} fileUrl={note.file_url} variant="outline" size="lg" label="⬇ PDF'i İndir" />
      </div>

      {/* Değerlendirmeler */}
      <ReviewSection
        noteId={note.id}
        isLoggedIn={!!user}
        isOwnNote={user?.id === note.user_id}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialReviews={(reviews ?? []) as any}
        existingRating={myReview?.rating ?? 0}
        existingComment={myReview?.comment ?? ''}
      />

      {/* Görüntüleme süresi takibi (giriş yapmış kullanıcılar için) */}
      <ViewTracker noteId={note.id} />
    </div>
  )
}

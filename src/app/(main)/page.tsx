import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import NoteCard from '@/components/notes/NoteCard'
import NoteFilter from '@/components/notes/NoteFilter'

export const revalidate = 60

// Kesişim: iki course-id listesini AND ile birleştirir
function intersect(a: string[] | null, b: string[] | undefined): string[] {
  if (!b)           return a ?? []
  if (a === null)   return b
  if (b.length === 0) return []
  const bSet = new Set(b)
  return a.filter(id => bSet.has(id))
}

const NULL_ID = '00000000-0000-0000-0000-000000000000'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; university?: string; type?: string; department?: string; course_code?: string }>
}) {
  const { q, university, type, department, course_code } = await searchParams
  const supabase = await createClient()

  const { data: universities } = await supabase
    .from('universities')
    .select('id, name, slug')
    .order('name')

  // --- Yapısal filtrelerden course_id kümesi oluştur ---
  let filteredCourseIds: string[] | null = null

  // Üniversite filtresi
  if (university) {
    const { data: uni } = await supabase
      .from('universities').select('id').eq('slug', university).maybeSingle()

    if (uni) {
      const { data: courses } = await supabase
        .from('courses')
        .select('id, departments!inner(faculties!inner(university_id))')
        .eq('departments.faculties.university_id', uni.id)
      filteredCourseIds = intersect(filteredCourseIds, courses?.map(c => c.id))
    } else {
      filteredCourseIds = []
    }
  }

  // Bölüm filtresi
  if (department) {
    const { data: depts } = await supabase
      .from('departments').select('id').ilike('name', `%${department}%`)

    if (depts && depts.length > 0) {
      const { data: courses } = await supabase
        .from('courses').select('id').in('department_id', depts.map(d => d.id))
      filteredCourseIds = intersect(filteredCourseIds, courses?.map(c => c.id))
    } else {
      filteredCourseIds = []
    }
  }

  // Ders kodu filtresi
  if (course_code) {
    const { data: courses } = await supabase
      .from('courses').select('id').ilike('code', `%${course_code.toUpperCase()}%`)
    filteredCourseIds = intersect(filteredCourseIds, courses?.map(c => c.id))
  }

  // --- Ana sorgu ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from('notes')
    .select(`
      *,
      reviews(count),
      courses (
        code, name,
        departments (
          name,
          faculties ( universities ( name ) )
        )
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(24)

  // Course ID filtresi uygula
  if (filteredCourseIds !== null) {
    query = query.in('course_id', filteredCourseIds.length > 0 ? filteredCourseIds : [NULL_ID])
  }

  // Not türü filtresi
  if (type) query = query.eq('note_type', type)

  // Metin araması: başlık + ders kodu + ders adı
  if (q) {
    const { data: courseMatches } = await supabase
      .from('courses').select('id').or(`code.ilike.%${q}%,name.ilike.%${q}%`)

    const ids = courseMatches?.map(c => c.id) ?? []
    if (ids.length > 0) {
      query = query.or(`title.ilike.%${q}%,course_id.in.(${ids.join(',')})`)
    } else {
      query = query.ilike('title', `%${q}%`)
    }
  }

  const { data: notes } = await query
  const count    = notes?.length ?? 0
  const hasNotes = count > 0
  const hasFilter = q || university || type || department || course_code

  return (
    <div className="max-w-7xl mx-auto px-4">

      {/* Hero */}
      <section className="py-14 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">NotKampüs&apos;e Hoş Geldin!</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Üniversite ders notlarını paylaş, başkalarının notlarına eriş ve paylaştığın notlardan kazanç elde et.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register"><Button size="lg">Hemen Başla</Button></Link>
          <Link href="/upload"><Button size="lg" variant="outline">Not Yükle</Button></Link>
        </div>
      </section>

      {/* Özellik kartları */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        {[
          { icon: '📚', title: 'Not Paylaş', desc: 'Ders notlarını PDF olarak yükle, onay sürecinden geçtikten sonra tüm öğrencilerle paylaşıma açılsın.' },
          { icon: '🔍', title: 'Notlara Eriş', desc: 'Üniversitene, bölümüne ve dersine göre filtrele. İhtiyacın olan notları hızlıca bul.' },
          { icon: '💰', title: 'Kazanç Elde Et', desc: 'Paylaştığın notlar görüntülendikçe ve indirildiğinde reklam gelirinden pay al.' },
        ].map(f => (
          <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Arama + filtreler */}
      <section className="pb-16">
        <Suspense>
          <NoteFilter universities={universities ?? []} />
        </Suspense>

        {/* Sonuç sayısı */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <h2 className="text-xl font-semibold">
            {hasFilter ? 'Arama Sonuçları' : 'Son Eklenen Notlar'}
          </h2>
          {hasFilter && (
            <span className="text-sm text-muted-foreground">
              {count} not bulundu
            </span>
          )}
        </div>

        {hasNotes ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note: Parameters<typeof NoteCard>[0]['note']) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border">
            <p className="text-4xl mb-3">{hasFilter ? '🔍' : '📭'}</p>
            <p className="text-gray-700 font-medium">
              {hasFilter
                ? 'Aradığın nota ulaşamadık — ilk notu sen yükle!'
                : 'Henüz onaylanmış not yok.'}
            </p>
            <div className="flex gap-3 justify-center mt-4">
              {hasFilter && (
                <Link href="/"><Button variant="outline">Tüm Notları Gör</Button></Link>
              )}
              <Link href="/upload"><Button>Not Yükle</Button></Link>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

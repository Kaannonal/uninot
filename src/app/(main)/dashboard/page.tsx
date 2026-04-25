import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:      { label: 'İncelemede', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  approved:     { label: 'Yayında',    className: 'bg-green-100  text-green-800  border-green-200'  },
  rejected:     { label: 'Reddedildi', className: 'bg-red-100    text-red-800    border-red-200'    },
  under_review: { label: 'İncelemede', className: 'bg-blue-100   text-blue-800   border-blue-200'   },
  removed:      { label: 'Kaldırıldı', className: 'bg-gray-100   text-gray-600   border-gray-200'   },
}

const noteTypeLabels: Record<string, string> = {
  vize: 'Vize', final: 'Final', ozet: 'Özet', formul: 'Formül', diger: 'Diğer',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: notes }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase
      .from('notes')
      .select(`
        id, title, note_type, status,
        view_count, download_count, avg_rating,
        created_at,
        courses (
          code, name,
          departments (
            name,
            faculties ( universities ( name ) )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const noteList = notes ?? []

  // Özet istatistikler
  const totalNotes     = noteList.length
  const approvedCount  = noteList.filter(n => n.status === 'approved').length
  const totalViews     = noteList.reduce((s, n) => s + (n.view_count ?? 0), 0)
  const totalDownloads = noteList.reduce((s, n) => s + (n.download_count ?? 0), 0)

  // Tahmini kazanç: geçerli görüntülenme × 0.5 + geçerli indirme × 2
  const estimatedEarning = (totalViews * 0.5) + (totalDownloads * 2)

  const firstName = (profile?.full_name ?? user.email ?? 'Kullanıcı').split(' ')[0]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Başlık */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Merhaba, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Not istatistiklerin ve kazançların</p>
        </div>
        <Link href="/upload">
          <Button>+ Not Yükle</Button>
        </Link>
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Toplam Not',   value: totalNotes,     icon: '📄' },
          { label: 'Yayında',      value: approvedCount,  icon: '✅' },
          { label: 'Görüntülenme', value: totalViews,     icon: '👁' },
          { label: 'İndirme',      value: totalDownloads, icon: '⬇' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-5 pb-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value.toLocaleString('tr-TR')}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tahmini kazanç */}
      <Card className="mb-8 border-green-200 bg-green-50">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Tahmini Kazanç</p>
              <p className="text-3xl font-bold text-green-800 mt-1">
                ₺{estimatedEarning.toFixed(2)}
              </p>
              <p className="text-xs text-green-600 mt-2">
                Hesaplama: (görüntülenme × ₺0,50) + (indirme × ₺2,00)
                <br />
                <span className="font-medium">Ödeme sistemi yakında aktif olacak.</span>
              </p>
            </div>
            <div className="text-5xl opacity-80">💰</div>
          </div>
        </CardContent>
      </Card>

      {/* Notlarım */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Notlarım</h2>

        {noteList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-600">Henüz not yüklemedin.</p>
            <Link href="/upload" className="mt-4 inline-block">
              <Button variant="outline">İlk Notunu Yükle</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {noteList.map(note => {
              const cfg        = statusConfig[note.status] ?? statusConfig.pending
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const course     = note.courses as any
              const department = course?.departments
              const university = department?.faculties?.universities?.name

              return (
                <div
                  key={note.id}
                  className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row sm:items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    {/* Başlık + durum */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium truncate">{note.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${cfg.className}`}>
                        {cfg.label}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {noteTypeLabels[note.note_type] ?? note.note_type}
                      </Badge>
                    </div>

                    {/* Üniversite / Bölüm / Ders */}
                    <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground mb-2">
                      {university  && <span>🏛 {university}</span>}
                      {department  && <span>· {department.name}</span>}
                      {course      && (
                        <span>· <span className="font-mono">{course.code}</span> {course.name}</span>
                      )}
                    </div>

                    {/* İstatistikler + tarih */}
                    <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                      <span>👁 {note.view_count} görüntülenme</span>
                      <span>⬇ {note.download_count} indirme</span>
                      {(note.avg_rating ?? 0) > 0 && (
                        <span>⭐ {note.avg_rating.toFixed(1)}</span>
                      )}
                      <span>🗓 {new Date(note.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>

                  {/* Aksiyon butonları */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link href={`/dashboard/notes/${note.id}/edit`}>
                      <Button variant="outline" size="sm" className="w-full">Düzenle</Button>
                    </Link>
                    {note.status === 'approved' && (
                      <Link href={`/notes/${note.id}`}>
                        <Button size="sm" className="w-full">Görüntüle</Button>
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

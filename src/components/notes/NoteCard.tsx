import Link from 'next/link'
import { Note } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const noteTypeLabels: Record<string, string> = {
  vize: 'Vize', final: 'Final', ozet: 'Özet', formul: 'Formül', diger: 'Diğer'
}

interface NoteWithMeta extends Note {
  courses?: {
    code: string
    name: string
    departments?: {
      name: string
      faculties?: {
        universities?: { name: string }
      }
    }
  }
  // Supabase count join — [{ count: N }] formatında gelebilir
  reviews?: { count: number }[] | { id: string }[]
}

export default function NoteCard({ note }: { note: NoteWithMeta }) {
  const course = note.courses
  const university = course?.departments?.faculties?.universities?.name
  // reviews alanı { count } ya da { id } nesnelerinin listesi olabilir
  const reviewCount = Array.isArray(note.reviews)
    ? 'count' in (note.reviews[0] ?? {})
      ? (note.reviews[0] as { count: number }).count
      : note.reviews.length
    : 0

  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{note.title}</CardTitle>
            <Badge variant="secondary" className="shrink-0">
              {noteTypeLabels[note.note_type] ?? note.note_type}
            </Badge>
          </div>
          {course && (
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-mono">{course.code}</span> · {course.name}
              {university && <span className="ml-1">— {university}</span>}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {note.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{note.description}</p>
          )}
          <div className="mt-3 flex gap-3 text-xs text-gray-500">
            <span>👁 {note.view_count}</span>
            <span>⬇ {note.download_count}</span>
            {note.avg_rating > 0 && (
              <span>⭐ {note.avg_rating.toFixed(1)}{reviewCount > 0 && ` (${reviewCount})`}</span>
            )}
            {note.term && <span>📅 {note.term}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

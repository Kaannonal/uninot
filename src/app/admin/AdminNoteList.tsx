'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Supabase nested join'ları generated type olmadan array döndürür
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PendingNote = Record<string, any>

export default function AdminNoteList({ initialNotes }: { initialNotes: PendingNote[] }) {
  const [notes, setNotes] = useState(initialNotes)
  const [processing, setProcessing] = useState<string | null>(null)
  const supabase = createClient()

  const handleAction = async (noteId: string, newStatus: 'approved' | 'rejected') => {
    setProcessing(noteId)
    const { error } = await supabase
      .from('notes')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', noteId)

    if (!error) {
      setNotes(prev => prev.filter(n => n.id !== noteId))
    } else {
      alert(`Hata: ${error.message}`)
    }
    setProcessing(null)
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border">
        <p className="text-4xl mb-3">✅</p>
        <p className="text-gray-600 font-medium">Bekleyen not yok</p>
        <p className="text-sm text-muted-foreground mt-1">Tüm notlar incelendi.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notes.map(note => {
        const course     = note.courses
        const department = course?.departments
        const university = department?.faculties?.universities
        const uploader   = note.profiles?.full_name ?? 'Anonim'
        const isProcessing = processing === note.id

        return (
          <div
            key={note.id}
            className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{note.title}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                {university && <span>🏛 {university.name}</span>}
                {department && <span>· {department.name}</span>}
                {course     && <span>· <span className="font-mono">{course.code}</span> {course.name}</span>}
              </div>
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                <span>👤 {uploader}</span>
                <span>🗓 {new Date(note.created_at).toLocaleDateString('tr-TR')}</span>
                <a
                  href={`/admin/preview/${note.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Önizle →
                </a>
              </div>
            </div>

            <div className="flex gap-2 sm:shrink-0 sm:flex-col md:flex-row">
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50"
                disabled={isProcessing}
                onClick={() => handleAction(note.id, 'approved')}
              >
                {isProcessing ? '…' : 'Onayla'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                disabled={isProcessing}
                onClick={() => handleAction(note.id, 'rejected')}
              >
                {isProcessing ? '…' : 'Reddet'}
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

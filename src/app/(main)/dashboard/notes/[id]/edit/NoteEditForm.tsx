'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const NOTE_TYPES = [
  { value: 'vize',   label: 'Vize Notu' },
  { value: 'final',  label: 'Final Notu' },
  { value: 'ozet',   label: 'Özet' },
  { value: 'formul', label: 'Formül Kağıdı' },
  { value: 'diger',  label: 'Diğer' },
]

function TriggerLabel({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <span className={cn('flex flex-1 text-left text-sm truncate', !label && 'text-muted-foreground')}>
      {label || placeholder}
    </span>
  )
}

interface Note {
  id: string
  title: string
  description: string | null
  note_type: string
  term: string | null
  page_count: number | null
  status: string
  file_url: string
}

export default function NoteEditForm({ note }: { note: Note }) {
  const supabase = useMemo(() => createClient(), [])
  const router   = useRouter()

  const [title,       setTitle]       = useState(note.title)
  const [description, setDescription] = useState(note.description ?? '')
  const [noteType,    setNoteType]    = useState(note.note_type)
  const [noteTypeLabel, setNoteTypeLabel] = useState(
    NOTE_TYPES.find(t => t.value === note.note_type)?.label ?? note.note_type
  )
  const [term,        setTerm]        = useState(note.term ?? '')
  const [pageCount,   setPageCount]   = useState(note.page_count?.toString() ?? '')

  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const handleNoteTypeChange = (val: string | null) => {
    if (!val) return
    const t = NOTE_TYPES.find(t => t.value === val)
    setNoteType(val!)
    setNoteTypeLabel(t?.label ?? val!)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Başlık boş bırakılamaz.'); return }

    setSaving(true)
    setError('')

    const { error } = await supabase
      .from('notes')
      .update({
        title:       title.trim(),
        description: description.trim() || null,
        note_type:   noteType,
        term:        term.trim() || null,
        page_count:  pageCount ? parseInt(pageCount) : null,
        status:      'pending',        // admin tekrar onaylasın
        updated_at:  new Date().toISOString(),
      })
      .eq('id', note.id)

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div className="space-y-2">
        <Label htmlFor="title">Başlık <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          placeholder="Notun içeriği hakkında kısa bilgi…"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Not Türü <span className="text-red-500">*</span></Label>
          <Select value={noteType} onValueChange={handleNoteTypeChange}>
            <SelectTrigger className="w-full">
              <TriggerLabel label={noteTypeLabel} placeholder="Tür seç…" />
            </SelectTrigger>
            <SelectContent>
              {NOTE_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="term">Dönem</Label>
          <Input
            id="term"
            placeholder="örn: Spring 2026"
            value={term}
            onChange={e => setTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pageCount">Sayfa Sayısı</Label>
        <Input
          id="pageCount"
          type="number"
          min="1"
          value={pageCount}
          onChange={e => setPageCount(e.target.value)}
          placeholder="örn: 12"
        />
      </div>

      {/* PDF değiştirilemez */}
      <div className="rounded-lg bg-gray-50 border px-4 py-3 text-sm text-muted-foreground">
        📎 PDF dosyası değiştirilemez. Farklı bir PDF için yeni not yükle.
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard')}
          disabled={saving}
        >
          İptal
        </Button>
      </div>
    </form>
  )
}

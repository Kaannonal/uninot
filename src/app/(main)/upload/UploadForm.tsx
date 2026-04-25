'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface University { id: string; name: string; city: string }

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

// "bilgisayar mühendisliği" → "Bilgisayar Mühendisliği"
function normalizeName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR'))
    .join(' ')
}

// "cmpe 236" → "CMPE236"
function normalizeCourseCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

// Bölüm için kısa kod türet — "Bilgisayar Mühendisliği" → "BM"
function deriveCode(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].substring(0, 4).toUpperCase()
  return words.map(w => w.charAt(0)).join('').toUpperCase().substring(0, 6)
}

export default function UploadForm({
  universities, userId,
}: { universities: University[]; userId: string }) {
  const supabase = useMemo(() => createClient(), [])

  // Üniversite (select)
  const [universityId,    setUniversityId]    = useState('')
  const [universityLabel, setUniversityLabel] = useState('')

  // Fakülte, Bölüm, Ders — serbest metin
  const [facultyName,  setFacultyName]  = useState('')
  const [deptName,     setDeptName]     = useState('')
  const [courseCode,   setCourseCode]   = useState('')
  const [courseName,   setCourseName]   = useState('')

  // Not alanları
  const [title,         setTitle]         = useState('')
  const [description,   setDescription]   = useState('')
  const [noteType,      setNoteType]      = useState('')
  const [noteTypeLabel, setNoteTypeLabel] = useState('')
  const [term,          setTerm]          = useState('')
  const [pageCount,     setPageCount]     = useState('')
  const [pdfFile,       setPdfFile]       = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const handleUniversityChange = (uid: string | null) => {
    if (!uid) return
    const uni = universities.find(u => u.id === uid)
    setUniversityId(uid!)
    setUniversityLabel(uni?.name ?? uid)
  }

  const handleNoteTypeChange = (val: string | null) => {
    if (!val) return
    const t = NOTE_TYPES.find(t => t.value === val)
    setNoteType(val!)
    setNoteTypeLabel(t?.label ?? val!)
  }

  // Tablo satırı bul ya da yeni oluştur, id döndür
  async function findOrCreate(
    table: string,
    match: Record<string, string>,
    insert: Record<string, string>,
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase.from(table).select('id')
    for (const [col, val] of Object.entries(match)) q = q.eq(col, val)
    const { data: existing } = await q.maybeSingle()
    if (existing) return existing.id

    const { data: created, error } = await supabase
      .from(table)
      .insert({ ...match, ...insert })
      .select('id')
      .single()
    if (error) throw new Error(`${table} kaydı oluşturulamadı: ${error.message}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (created as any).id
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const nFaculty = normalizeName(facultyName)
    const nDept    = normalizeName(deptName)
    const nCode    = normalizeCourseCode(courseCode)

    if (!universityId)      { setError('Lütfen üniversite seç.'); return }
    if (!nFaculty)          { setError('Lütfen fakülte adını gir.'); return }
    if (!nDept)             { setError('Lütfen bölüm adını gir.'); return }
    if (!nCode)             { setError('Lütfen ders kodunu gir.'); return }
    if (!courseName.trim()) { setError('Lütfen ders adını gir.'); return }
    if (!noteType)          { setError('Lütfen not türünü seç.'); return }
    if (!pdfFile)           { setError('Lütfen bir PDF dosyası seç.'); return }

    setLoading(true)
    try {
      // 1. Fakülte — bul ya da oluştur
      const facultyId = await findOrCreate(
        'faculties',
        { university_id: universityId, name: nFaculty },
        {},
      )

      // 2. Bölüm — bul ya da oluştur
      const departmentId = await findOrCreate(
        'departments',
        { faculty_id: facultyId, name: nDept },
        { code: deriveCode(nDept) },
      )

      // 3. Ders — bul ya da oluştur
      const courseId = await findOrCreate(
        'courses',
        { department_id: departmentId, code: nCode },
        { name: courseName.trim(), language: 'tr' },
      )

      // 4. PDF yükle
      const timestamp = Date.now()
      const safeName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${userId}/${timestamp}_${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(path, pdfFile, { contentType: 'application/pdf' })
      if (uploadError) throw new Error(`Dosya yüklenemedi: ${uploadError.message}`)

      const { data: { publicUrl } } = supabase.storage.from('pdfs').getPublicUrl(path)

      // 5. Notu kaydet
      const { error: insertError } = await supabase.from('notes').insert({
        user_id:    userId,
        course_id:  courseId,
        title,
        description,
        file_url:   publicUrl,
        note_type:  noteType,
        term,
        page_count: pageCount ? parseInt(pageCount) : null,
        status:     'pending',
      })
      if (insertError) throw new Error(`Kayıt hatası: ${insertError.message}`)

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSuccess(false)
    setUniversityId(''); setUniversityLabel('')
    setFacultyName(''); setDeptName(''); setCourseCode(''); setCourseName('')
    setTitle(''); setDescription(''); setTerm(''); setPageCount(''); setPdfFile(null)
    setNoteType(''); setNoteTypeLabel('')
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-semibold">Notun alındı!</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Notun incelemeye alındı, onaylandıktan sonra yayınlanacak.
          </p>
          <Button variant="outline" onClick={resetForm}>Başka Not Yükle</Button>
        </CardContent>
      </Card>
    )
  }

  const nCode = normalizeCourseCode(courseCode)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Ders bilgisi */}
      <div className="space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Ders Bilgisi
        </h2>

        {/* Üniversite — select */}
        <div className="space-y-2">
          <Label>Üniversite <span className="text-red-500">*</span></Label>
          <Select value={universityId} onValueChange={handleUniversityChange}>
            <SelectTrigger className="w-full">
              <TriggerLabel label={universityLabel} placeholder="Üniversite seç…" />
            </SelectTrigger>
            <SelectContent>
              {universities.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fakülte — text */}
        <div className="space-y-2">
          <Label htmlFor="facultyName">Fakülte <span className="text-red-500">*</span></Label>
          <Input
            id="facultyName"
            placeholder="örn: Mühendislik Fakültesi, Fen Edebiyat Fakültesi"
            value={facultyName}
            onChange={e => setFacultyName(e.target.value)}
          />
          {facultyName.trim() && (
            <p className="text-xs text-muted-foreground">
              Kaydedilecek: <span className="font-medium">{normalizeName(facultyName)}</span>
            </p>
          )}
        </div>

        {/* Bölüm — text */}
        <div className="space-y-2">
          <Label htmlFor="deptName">Bölüm <span className="text-red-500">*</span></Label>
          <Input
            id="deptName"
            placeholder="örn: Bilgisayar Mühendisliği, İşletme"
            value={deptName}
            onChange={e => setDeptName(e.target.value)}
          />
          {deptName.trim() && (
            <p className="text-xs text-muted-foreground">
              Kaydedilecek: <span className="font-medium">{normalizeName(deptName)}</span>
            </p>
          )}
        </div>

        {/* Ders kodu + adı — text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="courseCode">Ders Kodu <span className="text-red-500">*</span></Label>
            <Input
              id="courseCode"
              placeholder="örn: CMPE236, MAT101"
              value={courseCode}
              onChange={e => setCourseCode(e.target.value)}
            />
            {courseCode && (
              <p className="text-xs text-muted-foreground">
                Normalize: <span className="font-mono font-medium">{nCode}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseName">Ders Adı <span className="text-red-500">*</span></Label>
            <Input
              id="courseName"
              placeholder="örn: Mikroişlemciler, Veri Yapıları"
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Not detayları */}
      <div className="space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Not Detayları
        </h2>

        <div className="space-y-2">
          <Label htmlFor="title">Başlık <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            placeholder="örn: Veri Yapıları Vize Özeti"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Açıklama</Label>
          <Textarea
            id="description"
            placeholder="Notun içeriği hakkında kısa bilgi ver…"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            placeholder="örn: 12"
            value={pageCount}
            onChange={e => setPageCount(e.target.value)}
          />
        </div>
      </div>

      {/* PDF */}
      <div className="space-y-2">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          PDF Dosyası
        </h2>
        <Label htmlFor="pdf">Dosya seç <span className="text-red-500">*</span></Label>
        <Input
          id="pdf"
          type="file"
          accept=".pdf,application/pdf"
          onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
          className="cursor-pointer"
        />
        {pdfFile && (
          <p className="text-xs text-muted-foreground">
            Seçilen: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={
          loading ||
          !universityId || !facultyName.trim() || !deptName.trim() ||
          !nCode || !courseName.trim() || !title || !noteType || !pdfFile
        }
      >
        {loading ? 'Yükleniyor…' : 'Notu Yükle'}
      </Button>
    </form>
  )
}

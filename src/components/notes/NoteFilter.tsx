'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface University { id: string; name: string; slug: string }

const NOTE_TYPES = [
  { value: 'vize',   label: 'Vize' },
  { value: 'final',  label: 'Final' },
  { value: 'ozet',   label: 'Özet' },
  { value: 'formul', label: 'Formül' },
  { value: 'diger',  label: 'Diğer' },
]

function TriggerLabel({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <span className={cn('flex flex-1 text-left text-sm truncate', !label && 'text-muted-foreground')}>
      {label || placeholder}
    </span>
  )
}

export default function NoteFilter({ universities }: { universities: University[] }) {
  const router     = useRouter()
  const params     = useSearchParams()

  // Yerel state — URL'den başlat
  const [q,          setQ]          = useState(params.get('q') ?? '')
  const [university, setUniversity] = useState(params.get('university') ?? '')
  const [type,       setType]       = useState(params.get('type') ?? '')
  const [department, setDepartment] = useState(params.get('department') ?? '')
  const [courseCode, setCourseCode] = useState(params.get('course_code') ?? '')

  const selectedUni  = universities.find(u => u.slug === university)
  const selectedType = NOTE_TYPES.find(t => t.value === type)

  // URL'i güncelle — tüm filtreler bir seferde
  const push = (overrides: Record<string, string> = {}) => {
    const values: Record<string, string> = {
      q, university, type, department, course_code: courseCode, ...overrides,
    }
    const p = new URLSearchParams()
    Object.entries(values).forEach(([k, v]) => { if (v.trim()) p.set(k, v.trim()) })
    router.push(`/?${p.toString()}`)
  }

  // Select değişince anında URL'e yansıt
  const handleSelectChange = (key: string, value: string | null) => {
    const v = value ?? ''
    if (key === 'university') setUniversity(v)
    if (key === 'type')       setType(v)
    push({ [key]: v })
  }

  // Form submit — text alanları URL'e yansır
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    push()
  }

  const hasFilter = q || university || type || department || courseCode

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* Büyük arama çubuğu */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg pointer-events-none">
          🔍
        </span>
        <Input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Not başlığı, ders kodu veya ders adı ara…"
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Filtre satırı — mobilde 2 kolon grid, masaüstünde tek satır */}
      <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 items-center">

        {/* Üniversite */}
        <Select
          value={university}
          onValueChange={v => handleSelectChange('university', v)}
        >
          <SelectTrigger className="w-full md:w-52">
            <TriggerLabel label={selectedUni?.name ?? ''} placeholder="Tüm üniversiteler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tüm üniversiteler</SelectItem>
            {universities.map(u => (
              <SelectItem key={u.id} value={u.slug}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Not türü */}
        <Select
          value={type}
          onValueChange={v => handleSelectChange('type', v)}
        >
          <SelectTrigger className="w-full md:w-36">
            <TriggerLabel label={selectedType?.label ?? ''} placeholder="Tüm türler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tüm türler</SelectItem>
            {NOTE_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bölüm — serbest metin */}
        <Input
          value={department}
          onChange={e => setDepartment(e.target.value)}
          placeholder="Bölüm"
          className="w-full md:w-48"
        />

        {/* Ders kodu — serbest metin */}
        <Input
          value={courseCode}
          onChange={e => setCourseCode(e.target.value)}
          placeholder="Ders kodu"
          className="w-full md:w-32 font-mono"
        />

        <Button type="submit" size="sm" className="col-span-2 md:col-span-1 w-full md:w-auto">Ara</Button>

        {hasFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ(''); setUniversity(''); setType(''); setDepartment(''); setCourseCode('')
              router.push('/')
            }}
          >
            Temizle ✕
          </Button>
        )}
      </div>
    </form>
  )
}

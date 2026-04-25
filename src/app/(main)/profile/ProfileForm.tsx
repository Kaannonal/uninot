'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface University   { id: string; name: string }
interface Department   { id: string; name: string; code: string }
interface InitialProfile {
  full_name:     string | null
  university_id: string | null
  department_id: string | null
}

function TriggerLabel({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <span className={cn('flex flex-1 text-left text-sm truncate', !label && 'text-muted-foreground')}>
      {label || placeholder}
    </span>
  )
}

export default function ProfileForm({
  userId, email, initialProfile, universities,
}: {
  userId: string
  email: string
  initialProfile: InitialProfile
  universities: University[]
}) {
  const supabase = useMemo(() => createClient(), [])

  const [fullName,      setFullName]      = useState(initialProfile.full_name ?? '')
  const [universityId,  setUniversityId]  = useState(initialProfile.university_id ?? '')
  const [universityLabel, setUniversityLabel] = useState(
    universities.find(u => u.id === initialProfile.university_id)?.name ?? ''
  )
  const [departments,   setDepartments]   = useState<Department[]>([])
  const [departmentId,  setDepartmentId]  = useState(initialProfile.department_id ?? '')
  const [departmentLabel, setDepartmentLabel] = useState('')
  const [loadingDeps,   setLoadingDeps]   = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [saved,         setSaved]         = useState(false)
  const [error,         setError]         = useState('')

  // Sayfa yüklenince mevcut bölümü getir
  useMemo(() => {
    if (!initialProfile.university_id) return
    supabase
      .from('departments')
      .select('id, name, code, faculties!inner(university_id)')
      .eq('faculties.university_id', initialProfile.university_id)
      .order('name')
      .then(({ data }) => {
        setDepartments(data ?? [])
        const dep = (data ?? []).find(d => d.id === initialProfile.department_id)
        if (dep) setDepartmentLabel(dep.name)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUniversityChange = async (uid: string | null) => {
    if (!uid) return
    const uni = universities.find(u => u.id === uid)
    setUniversityId(uid!)
    setUniversityLabel(uni?.name ?? '')
    setDepartmentId(''); setDepartmentLabel('')
    setDepartments([])
    setLoadingDeps(true)

    const { data } = await supabase
      .from('departments')
      .select('id, name, code, faculties!inner(university_id)')
      .eq('faculties.university_id', uid)
      .order('name')

    setDepartments(data ?? [])
    setLoadingDeps(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name:     fullName.trim() || null,
        university_id: universityId || null,
        department_id: departmentId || null,
      })
      .eq('id', userId)

    if (error) setError(error.message)
    else setSaved(true)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">

      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" value={email} disabled className="bg-gray-50 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Ad Soyad</Label>
        <Input
          id="fullName"
          placeholder="Adın Soyadın"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Üniversite</Label>
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

      <div className="space-y-2">
        <Label>Bölüm</Label>
        <Select
          value={departmentId}
          onValueChange={(v: string | null) => {
            if (!v) return
            const dep = departments.find(d => d.id === v)
            setDepartmentId(v!)
            setDepartmentLabel(dep?.name ?? '')
          }}
          disabled={!universityId || loadingDeps || departments.length === 0}
        >
          <SelectTrigger className="w-full">
            <TriggerLabel
              label={departmentLabel}
              placeholder={
                !universityId ? 'Önce üniversite seç' :
                loadingDeps ? 'Yükleniyor…' :
                departments.length === 0 ? 'Bölüm bulunamadı' :
                'Bölüm seç…'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {departments.map(d => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          ✓ Profil güncellendi.
        </p>
      )}

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? 'Kaydediliyor…' : 'Kaydet'}
      </Button>
    </form>
  )
}

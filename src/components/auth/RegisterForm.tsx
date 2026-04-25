'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const supabaseErrors: Record<string, string> = {
  'User already registered': 'Bu e-posta adresi zaten kayıtlı.',
  'Unable to validate email address: invalid format': 'Geçersiz e-posta formatı.',
  'Email rate limit exceeded': 'Çok fazla deneme yaptınız. Lütfen bekleyin.',
}

interface StrengthRule { label: string; ok: boolean }

function getStrengthRules(pw: string): StrengthRule[] {
  return [
    { label: 'En az 8 karakter',  ok: pw.length >= 8 },
    { label: 'En az 1 büyük harf', ok: /[A-ZÇĞİÖŞÜ]/.test(pw) },
    { label: 'En az 1 rakam',      ok: /[0-9]/.test(pw) },
  ]
}

export default function RegisterForm() {
  const [fullName,   setFullName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState(false)
  const [loading,    setLoading]    = useState(false)

  const rules    = getStrengthRules(password)
  const pwTouched = password.length > 0

  const validate = (): string => {
    const failed = rules.filter(r => !r.ok)
    if (failed.length > 0) return failed[0].label + ' şartını sağlamalısın.'
    if (password !== confirm) return 'Şifreler eşleşmiyor.'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const msg = validate()
    if (msg) { setError(msg); return }

    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      console.error('[RegisterForm]', error)
      setError(supabaseErrors[error.message] ?? `Bir hata oluştu: ${error.message}`)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="text-4xl">✉️</div>
          <h2 className="text-xl font-semibold">E-postanı doğrula</h2>
          <p className="text-muted-foreground text-sm">
            <strong>{email}</strong> adresine bir doğrulama e-postası gönderdik.
            Hesabını aktif etmek için bağlantıya tıkla.
          </p>
          <Link href="/login"><Button variant="outline" className="w-full">Giriş Yap</Button></Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Kayıt Ol</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input id="fullName" placeholder="Adın Soyadın"
              value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" placeholder="ornek@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          {/* Şifre */}
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="En az 8 karakter"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                tabIndex={-1}
                aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {/* Şifre gücü göstergesi */}
            {pwTouched && (
              <ul className="space-y-1 mt-1">
                {rules.map(r => (
                  <li key={r.label} className={`flex items-center gap-1.5 text-xs ${r.ok ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <span>{r.ok ? '✓' : '○'}</span>
                    {r.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Şifre tekrar */}
          <div className="space-y-2">
            <Label htmlFor="confirm">Şifre Tekrar</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Şifreni tekrar gir"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                className={`pr-10 ${confirm && confirm !== password ? 'border-red-400' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                tabIndex={-1}
                aria-label={showConfirm ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {confirm && confirm !== password && (
              <p className="text-xs text-red-500">Şifreler eşleşmiyor.</p>
            )}
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Kayıt oluşturuluyor…' : 'Kayıt Ol'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Kayıt olarak{' '}
            <Link href="/terms" className="underline hover:text-foreground">Kullanım Şartları</Link>
            {' '}ve{' '}
            <Link href="/privacy" className="underline hover:text-foreground">Gizlilik Politikası</Link>
            &apos;nı kabul etmiş olursun.
          </p>

          <p className="text-sm text-center text-muted-foreground">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">Giriş Yap</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const errorMessages: Record<string, string> = {
  'User already registered': 'Bu e-posta adresi zaten kayıtlı.',
  'Password should be at least 6 characters': 'Şifre en az 6 karakter olmalıdır.',
  'Unable to validate email address: invalid format': 'Geçersiz e-posta formatı.',
}

export default function RegisterForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      console.error('[RegisterForm] Supabase signUp error:', {
        message: error.message,
        status: error.status,
        code: (error as unknown as Record<string, unknown>).code,
        full: error,
      })
      setError(`[DEBUG] ${error.message}`)
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
            Hesabını aktif etmek için e-postadaki bağlantıya tıkla.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">Giriş Yap</Button>
          </Link>
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
            <Input
              id="fullName"
              type="text"
              placeholder="Adın Soyadın"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              placeholder="En az 6 karakter"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Giriş Yap
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

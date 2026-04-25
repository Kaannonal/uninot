'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bir şeyler ters gitti</h1>
        <p className="text-gray-500 mb-8">
          Beklenmedik bir hata oluştu. Lütfen tekrar dene veya ana sayfaya dön.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>Tekrar Dene</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
      <p className="mt-12 text-sm text-gray-400">
        <span className="font-semibold text-blue-600">UniNot</span> — Üniversite Ders Notları
      </p>
    </div>
  )
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-blue-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sayfa bulunamadı</h1>
        <p className="text-gray-500 mb-8">
          Aradığın sayfa mevcut değil veya kaldırılmış olabilir.
        </p>
        <Link href="/">
          <Button>Ana Sayfaya Dön</Button>
        </Link>
      </div>
      <p className="mt-12 text-sm text-gray-400">
        <span className="font-semibold text-blue-600">NotKampüs</span> — Üniversite Ders Notları
      </p>
    </div>
  )
}

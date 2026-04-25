import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t bg-white py-8 text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-semibold text-blue-600">UniNot</p>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/privacy" className="hover:text-gray-800 transition-colors">
            Gizlilik Politikası
          </Link>
          <Link href="/terms" className="hover:text-gray-800 transition-colors">
            Kullanım Şartları
          </Link>
          <a href="mailto:iletisim@uninot.com" className="hover:text-gray-800 transition-colors">
            iletisim@uninot.com
          </a>
        </nav>

        <p>© 2025 UniNot. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  )
}

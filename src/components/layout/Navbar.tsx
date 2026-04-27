'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user,   setUser]   = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Route değişince mobil menüyü kapat
  useEffect(() => { setIsOpen(false) }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = user ? (
    <>
      <Link href="/dashboard" onClick={() => setIsOpen(false)}
        className="block px-4 py-3 md:py-0 md:px-0 text-sm hover:text-blue-600 transition-colors">
        Dashboard
      </Link>
      <Link href="/profile" onClick={() => setIsOpen(false)}
        className="block px-4 py-3 md:py-0 md:px-0 text-sm hover:text-blue-600 transition-colors">
        Profil
      </Link>
      <Link href="/upload" onClick={() => setIsOpen(false)}
        className="block px-4 md:px-0">
        <Button size="sm" className="w-full md:w-auto">Not Yükle</Button>
      </Link>
      <button
        onClick={() => { setIsOpen(false); handleSignOut() }}
        className="block px-4 py-3 md:py-0 md:px-0 text-sm text-left hover:text-red-600 transition-colors w-full md:w-auto"
      >
        Çıkış
      </button>
    </>
  ) : (
    <>
      <Link href="/login" onClick={() => setIsOpen(false)}
        className="block px-4 py-3 md:py-0 md:px-0 text-sm hover:text-blue-600 transition-colors">
        Giriş Yap
      </Link>
      <Link href="/register" onClick={() => setIsOpen(false)}
        className="block px-4 md:px-0">
        <Button size="sm" className="w-full md:w-auto">Kayıt Ol</Button>
      </Link>
    </>
  )

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      {/* Ana bar */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600 shrink-0">
          NotKampüs
        </Link>

        {/* Masaüstü menü */}
        <div className="hidden md:flex items-center gap-3">
          {navLinks}
        </div>

        {/* Hamburger butonu — sadece mobil */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5"
          onClick={() => setIsOpen(o => !o)}
          aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
        >
          <span className={`block h-0.5 w-6 bg-gray-700 transition-transform duration-200 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 w-6 bg-gray-700 transition-opacity duration-200 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-gray-700 transition-transform duration-200 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobil menü dropdown */}
      {isOpen && (
        <div className="md:hidden border-t bg-white shadow-lg py-2 flex flex-col">
          {navLinks}
        </div>
      )}
    </nav>
  )
}

'use client'

import { useEffect, useRef } from 'react'

export default function ViewTracker({ noteId }: { noteId: string }) {
  const startTime = useRef(Date.now())
  const reported  = useRef(false)

  useEffect(() => {
    const report = async () => {
      if (reported.current) return
      reported.current = true
      const duration = Math.round((Date.now() - startTime.current) / 1000)
      await fetch('/api/notes/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_id: noteId, duration_seconds: duration }),
      }).catch(() => {})
    }

    // 30 saniye sonra otomatik kayıt
    const timer = setTimeout(report, 30_000)

    // Kullanıcı sekmeyi kapatırsa/ayrılırsa da kaydet
    window.addEventListener('beforeunload', report)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') report()
    })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeunload', report)
    }
  }, [noteId])

  return null
}

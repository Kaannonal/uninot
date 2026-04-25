'use client'

import { Button } from '@/components/ui/button'

interface Props {
  noteId: string
  fileUrl: string
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  label?: string
  className?: string
}

export default function DownloadButton({
  noteId, fileUrl,
  variant = 'default',
  size = 'default',
  label = '⬇ İndir',
  className,
}: Props) {
  const handleDownload = async () => {
    // İndirme kaydını API'ye bildir
    fetch('/api/notes/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note_id: noteId }),
    }).catch(() => {})

    // Yeni sekmede PDF'i aç (tarayıcı indirir)
    window.open(fileUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Button variant={variant} size={size} onClick={handleDownload} className={className}>
      {label}
    </Button>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  profiles: { full_name: string | null } | null
}

interface Props {
  noteId: string
  isLoggedIn: boolean
  isOwnNote: boolean
  initialReviews: Review[]
  existingRating: number   // 0 if none
  existingComment: string  // '' if none
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Puan">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="text-2xl transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${star} yıldız`}
        >
          {star <= (hovered || value) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-sm" aria-label={`${rating} yıldız`}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s}>{s <= Math.round(rating) ? '⭐' : '☆'}</span>
      ))}
    </span>
  )
}

export default function ReviewSection({
  noteId, isLoggedIn, isOwnNote, initialReviews, existingRating, existingComment,
}: Props) {
  const [rating,   setRating]   = useState(existingRating)
  const [comment,  setComment]  = useState(existingComment)
  const [reviews,  setReviews]  = useState<Review[]>(initialReviews)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  const isEdit = existingRating > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) { setError('Lütfen bir puan seç.'); return }
    setLoading(true)
    setError('')

    const res = await fetch(`/api/notes/${noteId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Bir hata oluştu.')
    } else {
      setSuccess(true)
      // Yorumu listeye optimistik ekle / güncelle
      setReviews(prev => {
        const filtered = prev.filter(r => r.profiles !== null) // keep existing (can't identify own easily)
        const newReview: Review = {
          id: Date.now().toString(),
          rating,
          comment: comment.trim() || null,
          created_at: new Date().toISOString(),
          profiles: { full_name: 'Sen' },
        }
        return [newReview, ...filtered]
      })
    }
    setLoading(false)
  }

  const canReview = isLoggedIn && !isOwnNote

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold mb-4">Değerlendirmeler</h2>

      {/* Yorum formu */}
      <div className="bg-white border rounded-xl p-5 mb-6">
        {!isLoggedIn && (
          <p className="text-sm text-muted-foreground">
            Puan vermek için{' '}
            <Link href="/login" className="text-blue-600 hover:underline">giriş yap</Link>.
          </p>
        )}

        {isLoggedIn && isOwnNote && (
          <p className="text-sm text-muted-foreground">Kendi notuna puan veremezsin.</p>
        )}

        {canReview && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">
                {isEdit ? 'Puanını güncelle' : 'Puan ver'}
              </p>
              <StarSelector value={rating} onChange={setRating} />
            </div>

            <div className="space-y-1">
              <Textarea
                placeholder="Yorum yaz… (isteğe bağlı, maks. 500 karakter)"
                value={comment}
                onChange={e => setComment(e.target.value.slice(0, 500))}
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                ✓ {isEdit ? 'Değerlendirmen güncellendi.' : 'Değerlendirmen gönderildi.'}
              </p>
            )}

            <Button type="submit" size="sm" disabled={loading || !rating}>
              {loading ? 'Gönderiliyor…' : isEdit ? 'Güncelle' : 'Yorum Gönder'}
            </Button>
          </form>
        )}
      </div>

      {/* Yorumlar listesi */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-2xl mb-2">💬</p>
          <p className="text-sm">Henüz yorum yapılmamış — ilk yorumu sen yap!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="font-medium text-sm">
                    {review.profiles?.full_name ?? 'Anonim'}
                  </span>
                  <span className="ml-2">
                    <StarDisplay rating={review.rating} />
                  </span>
                </div>
                <time className="text-xs text-muted-foreground shrink-0">
                  {new Date(review.created_at).toLocaleDateString('tr-TR')}
                </time>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

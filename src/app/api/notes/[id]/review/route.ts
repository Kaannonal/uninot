import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: noteId } = await params
  const supabase      = await createClient()
  const adminClient   = createAdminClient()

  // Auth kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Body
  const body = await req.json().catch(() => null)
  const { rating, comment } = body ?? {}

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Geçersiz puan (1-5 arası olmalı)' }, { status: 400 })
  }

  // Kendi notuna puan verme kontrolü
  const { data: note } = await supabase
    .from('notes')
    .select('user_id')
    .eq('id', noteId)
    .single()

  if (!note) return NextResponse.json({ error: 'Not bulunamadı' }, { status: 404 })
  if (note.user_id === user.id) {
    return NextResponse.json({ error: 'Kendi notuna puan veremezsin' }, { status: 403 })
  }

  // Yorum upsert (note_id + user_id unique constraint ile)
  const { error: upsertError } = await supabase
    .from('reviews')
    .upsert(
      { note_id: noteId, user_id: user.id, rating, comment: comment?.trim() || null },
      { onConflict: 'note_id,user_id' }
    )

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  // avg_rating güncelle (admin client — notes RLS bypass)
  const { data: allRatings } = await adminClient
    .from('reviews')
    .select('rating')
    .eq('note_id', noteId)

  if (allRatings && allRatings.length > 0) {
    const avg = allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length
    await adminClient
      .from('notes')
      .update({ avg_rating: Math.round(avg * 10) / 10 })
      .eq('id', noteId)
  }

  return NextResponse.json({ ok: true })
}

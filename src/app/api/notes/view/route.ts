import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Geçerli görüntüleme için minimum süre (saniye)
const MIN_DURATION = 30

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const { note_id, duration_seconds } = body ?? {}

  if (!note_id) return NextResponse.json({ error: 'note_id required' }, { status: 400 })

  const duration = typeof duration_seconds === 'number' ? duration_seconds : 0
  const is_valid = duration >= MIN_DURATION

  const { error } = await supabase.from('note_views').insert({
    note_id,
    user_id: user.id,
    duration_seconds: duration,
    is_valid,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Geçerli görüntüleme ise notes.view_count'u artır
  if (is_valid) {
    const { data: noteData } = await supabase
      .from('notes')
      .select('view_count')
      .eq('id', note_id)
      .single()

    if (noteData) {
      await supabase
        .from('notes')
        .update({ view_count: (noteData.view_count ?? 0) + 1 })
        .eq('id', note_id)
    }
  }

  return NextResponse.json({ ok: true, is_valid })
}

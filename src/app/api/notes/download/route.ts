import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const { note_id } = body ?? {}

  if (!note_id) return NextResponse.json({ error: 'note_id required' }, { status: 400 })

  // Her oturumdaki kullanıcıdan yalnızca bir kez geçerli indirme sayılır
  const { data: existing } = await supabase
    .from('note_downloads')
    .select('id')
    .eq('note_id', note_id)
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const is_valid = !existing

  await supabase.from('note_downloads').insert({
    note_id,
    user_id: user.id,
    is_valid,
  })

  if (is_valid) {
    const { data } = await supabase
      .from('notes')
      .select('download_count')
      .eq('id', note_id)
      .single()

    if (data) {
      await supabase
        .from('notes')
        .update({ download_count: (data.download_count ?? 0) + 1 })
        .eq('id', note_id)
    }
  }

  return NextResponse.json({ ok: true, is_valid })
}

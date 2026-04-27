import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendNoteApproved, sendNoteRejected } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: noteId } = await params
  const supabase     = await createClient()
  const adminClient  = createAdminClient()

  // Admin kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const { action } = body ?? {}
  if (action !== 'approved' && action !== 'rejected') {
    return NextResponse.json({ error: 'action must be approved or rejected' }, { status: 400 })
  }

  // Notu güncelle
  const { data: note, error: updateError } = await adminClient
    .from('notes')
    .update({ status: action, updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .select('title, user_id')
    .single()

  if (updateError || !note) {
    return NextResponse.json({ error: updateError?.message ?? 'Not bulunamadı' }, { status: 500 })
  }

  // Not sahibinin email adresini al (admin client gerekiyor)
  const sendEmail = async () => {
    try {
      const { data: { user: owner } } = await adminClient.auth.admin.getUserById(note.user_id)
      if (!owner?.email) return

      if (action === 'approved') {
        await sendNoteApproved(owner.email, note.title, noteId)
      } else {
        await sendNoteRejected(owner.email, note.title)
      }
    } catch (err) {
      // Email başarısız olsa ana işlem etkilenmesin
      console.error('[email] admin action email failed:', err)
    }
  }

  // Fire-and-forget — await etme
  sendEmail()

  return NextResponse.json({ ok: true })
}

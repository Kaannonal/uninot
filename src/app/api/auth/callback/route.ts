import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcome } from '@/lib/email'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')  // 'signup' | 'recovery' | ...
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Hoş geldin emaili yalnızca email doğrulama akışında gönder
      if (type === 'signup') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          const { data: profile } = await supabase
            .from('profiles').select('full_name').eq('id', user.id).single()
          const name = profile?.full_name ?? user.email.split('@')[0]
          // Fire-and-forget
          sendWelcome(user.email, name).catch(err =>
            console.error('[email] welcome email failed:', err)
          )
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

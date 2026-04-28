import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { month } = await req.json()

  // 1. O ayın gelir kaydını al
  const { data: revenue, error: revErr } = await supabase
    .from('monthly_revenue')
    .select('*')
    .eq('month', month)
    .single()

  if (revErr || !revenue) {
    return new Response(JSON.stringify({ error: 'Ay bulunamadı' }), { status: 404 })
  }

  const userPool = Number(revenue.user_pool)

  // 2. O aya ait tüm earnings kayıtlarını al
  const { data: earnings, error: earnErr } = await supabase
    .from('earnings')
    .select('*')
    .eq('month', month)

  if (earnErr || !earnings || earnings.length === 0) {
    return new Response(JSON.stringify({ error: 'Kazanç kaydı yok' }), { status: 404 })
  }

  // 3. Her notun performans skorunu hesapla
  const scored = earnings.map((e) => ({
    ...e,
    score: (e.valid_views ?? 0) + (e.valid_downloads ?? 0) * 3,
  }))

  const totalScore = scored.reduce((acc, e) => acc + e.score, 0)

  if (totalScore === 0) {
    return new Response(JSON.stringify({ error: 'Toplam skor sıfır' }), { status: 400 })
  }

  // 4. Her kullanıcının payını hesapla ve güncelle
  for (const e of scored) {
    const netEarning = (e.score / totalScore) * userPool

    await supabase
      .from('earnings')
      .update({
        performance_score: e.score,
        creator_net_earning: netEarning,
        status: 'confirmed',
      })
      .eq('id', e.id)
  }

  // 5. monthly_revenue durumunu güncelle
  await supabase
    .from('monthly_revenue')
    .update({ status: 'distributed' })
    .eq('month', month)

  return new Response(JSON.stringify({ success: true, month, userPool, totalScore }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

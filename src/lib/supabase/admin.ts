import { createClient } from '@supabase/supabase-js'

// Service role client — RLS bypass, sadece sunucu tarafında kullan
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

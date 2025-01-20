import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://rlatlpcnpgcegvjeebxe.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY is required')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

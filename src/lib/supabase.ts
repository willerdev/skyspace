import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jojpqchsqmtxurmlsavy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvanBxY2hzcW10eHVybWxzYXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTI3NzYsImV4cCI6MjA0ODY2ODc3Nn0.pwwm8DA7G1-20k5_Gj7sHt_RrwN_KfdylHgWrv1yIwM'

export const supabase = createClient(supabaseUrl, supabaseKey) 
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://sagifixjpwydaognqkbm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZ2lmaXhqcHd5ZGFvZ25xa2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjMwNjksImV4cCI6MjA4NzYzOTA2OX0.MuWTlL0TwCfs3lyOHK6ZmeIl_DCPWk3LRfpL-u9xv54'
)
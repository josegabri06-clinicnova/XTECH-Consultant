import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sjplrbbfmjvdnwrqmmsw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcGxyYmJmbWp2ZG53cnFtbXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTgyOTgsImV4cCI6MjA5NTAzNDI5OH0.DQnWIta54NQj0pgQFixRxdTJ6WlEDKSwCAZp5pQR-So';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

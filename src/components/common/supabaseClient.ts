import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
	`https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`,
	`${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
);

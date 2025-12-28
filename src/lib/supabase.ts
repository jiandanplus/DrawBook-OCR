import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Warn if keys are missing (for local dev without setup)
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase keys are missing! Authentication features will not work.');
}

// Export the user client
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

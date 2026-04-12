import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Stockage conditionnel selon la plateforme
let storage: any = undefined;

if (typeof window === 'undefined') {
  // Mode SSR/Web statique — pas de storage
  storage = undefined;
} else {
  try {
    storage = require(
      '@react-native-async-storage/async-storage'
    ).default;
  } catch {
    storage = undefined;
  }
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: storage,
      autoRefreshToken: true,
      persistSession: storage !== undefined,
      detectSessionInUrl: false,
    },
  }
);